const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface User {
  id: number;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role?: string;
}

export interface AdminUserRequest {
  email: string;
  password?: string;
  role: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface CategoryListResponse {
  categories: Category[];
  total: number;
}

export interface ImageResponse {
  id: number;
  filename: string;
  original_name: string;
  path: string;
  size_bytes: number;
  mime_type: string;
  uploaded_by: number;
  created_at: string;
  updated_at: string;
}

export interface ImageListResponse {
  images: ImageResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface CategoryRequest {
  name: string;
  slug: string;
  image_id?: number;
  active: boolean;
  chart_only: boolean;
}

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  image_id?: number;
  active: boolean;
  chart_only: boolean;
  created_at: string;
  updated_at: string;
  image?: ImageResponse;
}

export type Category = CategoryResponse;

export interface CategoryListResponse {
  categories: CategoryResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface MaterialRequest {
  name: string;
}

export interface MaterialResponse {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface MaterialListResponse {
  materials: MaterialResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface ColorRequest {
  name: string;
  image_id?: number;
  custom: boolean;
  material_id: number;
}

export interface ColorResponse {
  id: number;
  name: string;
  image_id?: number;
  custom: boolean;
  material_id: number;
  created_at: string;
  updated_at: string;
  image?: ImageResponse;
  material?: MaterialResponse;
}

export interface ColorListResponse {
  colors: ColorResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface AdditionalServiceRequest {
  name: string;
  description: string;
  price: number;
  image_ids: number[];
}

export interface AdditionalServiceResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  created_at: string;
  updated_at: string;
  images: ImageResponse[];
}

export interface AdditionalServiceListResponse {
  additional_services: AdditionalServiceResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductRequest {
  name: string;
  short_description: string;
  description: string;
  material_id?: number;
  main_image_id: number;
  category_id?: number;
  image_ids: number[];
  additional_service_ids: number[];
}

export interface ProductResponse {
  id: number;
  name: string;
  short_description: string;
  description: string;
  material_id?: number;
  main_image_id: number;
  category_id?: number;
  min_price: number;
  created_at: string;
  updated_at: string;
  material?: MaterialResponse;
  main_image: ImageResponse;
  category?: CategoryResponse;
  images: ImageResponse[];
  additional_services: AdditionalServiceResponse[];
}

export interface ProductListResponse {
  products: ProductResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface SizeRequest {
  name: string;
  product_id: number;
  base_price: number;
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

export interface SizeResponse {
  id: number;
  name: string;
  product_id: number;
  base_price: number;
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  created_at: string;
  updated_at: string;
  product: ProductResponse;
}

export interface SizeListResponse {
  sizes: SizeResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductVariantRequest {
  product_id: number;
  name: string;
  color_id: number;
  is_default: boolean;
  image_ids: number[];
}

export interface ProductVariantResponse {
  id: number;
  product_id: number;
  name: string;
  color_id: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  product: ProductResponse;
  color: ColorResponse;
  images: ImageResponse[];
}

export interface ProductVariantListResponse {
  product_variants: ProductVariantResponse[];
  total: number;
  page: number;
  limit: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOnAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('access_token');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && retryOnAuth && !endpoint.includes('/auth/')) {
      const refreshSuccess = await this.tryRefreshToken();
      if (refreshSuccess) {
        // Retry the original request with new token
        return this.request<T>(endpoint, options, false);
      } else {
        // Refresh failed, redirect to login
        this.handleAuthFailure();
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private async tryRefreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        return false;
      }

      const response = await this.refreshToken(refreshToken);
      
      // Update stored tokens
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  private handleAuthFailure() {
    // Clear stored tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async getProfile(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/api/auth/profile');
  }

  // Admin User Management
  async listUsers(page: number = 1, limit: number = 10, search?: string): Promise<UserListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append('search', search);
    
    return this.request<UserListResponse>(`/api/admin/users?${params}`);
  }

  async createUser(userData: AdminUserRequest): Promise<User> {
    return this.request<User>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: number, userData: AdminUserRequest): Promise<User> {
    return this.request<User>(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin Image Management
  async uploadImage(file: File): Promise<ImageResponse> {
    return this.uploadFileWithAuth(file, '/api/admin/images/upload');
  }

  private async uploadFileWithAuth(file: File, endpoint: string, retryOnAuth: boolean = true): Promise<ImageResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && retryOnAuth) {
      const refreshSuccess = await this.tryRefreshToken();
      if (refreshSuccess) {
        // Retry the upload with new token
        return this.uploadFileWithAuth(file, endpoint, false);
      } else {
        // Refresh failed, redirect to login
        this.handleAuthFailure();
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async listImages(page: number = 1, limit: number = 10): Promise<ImageListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    return this.request<ImageListResponse>(`/api/admin/images?${params}`);
  }

  async deleteImage(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/admin/images/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin Category Management
  async listCategories(
    page: number = 1, 
    limit: number = 10, 
    search?: string, 
    active?: boolean, 
    chartOnly?: boolean
  ): Promise<CategoryListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append('search', search);
    if (active !== undefined) params.append('active', active.toString());
    if (chartOnly !== undefined) params.append('chart_only', chartOnly.toString());
    
    return this.request<CategoryListResponse>(`/api/admin/categories?${params}`);
  }

  async createCategory(categoryData: CategoryRequest): Promise<CategoryResponse> {
    return this.request<CategoryResponse>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async getCategory(id: number): Promise<CategoryResponse> {
    return this.request<CategoryResponse>(`/api/admin/categories/${id}`);
  }

  async updateCategory(id: number, categoryData: CategoryRequest): Promise<CategoryResponse> {
    return this.request<CategoryResponse>(`/api/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/admin/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleCategoryActive(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/admin/categories/${id}/toggle`, {
      method: 'PATCH',
    });
  }

  // Admin Material Management
  async listMaterials(
    page: number = 1, 
    limit: number = 10, 
    search?: string
  ): Promise<MaterialListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append('search', search);
    
    return this.request<MaterialListResponse>(`/api/admin/materials?${params}`);
  }

  async createMaterial(materialData: MaterialRequest): Promise<MaterialResponse> {
    return this.request<MaterialResponse>('/api/admin/materials', {
      method: 'POST',
      body: JSON.stringify(materialData),
    });
  }

  async getMaterial(id: number): Promise<MaterialResponse> {
    return this.request<MaterialResponse>(`/api/admin/materials/${id}`);
  }

  async updateMaterial(id: number, materialData: MaterialRequest): Promise<MaterialResponse> {
    return this.request<MaterialResponse>(`/api/admin/materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(materialData),
    });
  }

  async deleteMaterial(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/admin/materials/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin Color Management
  async listColors(
    page: number = 1, 
    limit: number = 10, 
    search?: string,
    materialId?: number,
    custom?: boolean
  ): Promise<ColorListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append('search', search);
    if (materialId !== undefined) params.append('material_id', materialId.toString());
    if (custom !== undefined) params.append('custom', custom.toString());
    
    return this.request<ColorListResponse>(`/api/admin/colors?${params}`);
  }

  async createColor(colorData: ColorRequest): Promise<ColorResponse> {
    return this.request<ColorResponse>('/api/admin/colors', {
      method: 'POST',
      body: JSON.stringify(colorData),
    });
  }

  async getColor(id: number): Promise<ColorResponse> {
    return this.request<ColorResponse>(`/api/admin/colors/${id}`);
  }

  async updateColor(id: number, colorData: ColorRequest): Promise<ColorResponse> {
    return this.request<ColorResponse>(`/api/admin/colors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(colorData),
    });
  }

  async deleteColor(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/admin/colors/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin Additional Service Management
  async listAdditionalServices(
    page: number = 1, 
    limit: number = 10, 
    search?: string,
    minPrice?: number,
    maxPrice?: number
  ): Promise<AdditionalServiceListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append('search', search);
    if (minPrice !== undefined) params.append('min_price', minPrice.toString());
    if (maxPrice !== undefined) params.append('max_price', maxPrice.toString());
    
    return this.request<AdditionalServiceListResponse>(`/api/admin/additional-services?${params}`);
  }

  async createAdditionalService(serviceData: AdditionalServiceRequest): Promise<AdditionalServiceResponse> {
    return this.request<AdditionalServiceResponse>('/api/admin/additional-services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  async getAdditionalService(id: number): Promise<AdditionalServiceResponse> {
    return this.request<AdditionalServiceResponse>(`/api/admin/additional-services/${id}`);
  }

  async updateAdditionalService(id: number, serviceData: AdditionalServiceRequest): Promise<AdditionalServiceResponse> {
    return this.request<AdditionalServiceResponse>(`/api/admin/additional-services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData),
    });
  }

  async deleteAdditionalService(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/admin/additional-services/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin Product Management
  async listProducts(
    page: number = 1, 
    limit: number = 10, 
    search?: string,
    categoryId?: number,
    materialId?: number
  ): Promise<ProductListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append('search', search);
    if (categoryId !== undefined) params.append('category_id', categoryId.toString());
    if (materialId !== undefined) params.append('material_id', materialId.toString());
    
    return this.request<ProductListResponse>(`/api/admin/products?${params}`);
  }

  async createProduct(productData: ProductRequest): Promise<ProductResponse> {
    return this.request<ProductResponse>('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async getProduct(id: number): Promise<ProductResponse> {
    return this.request<ProductResponse>(`/api/admin/products/${id}`);
  }

  async updateProduct(id: number, productData: ProductRequest): Promise<ProductResponse> {
    return this.request<ProductResponse>(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/admin/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Size Management
  async listSizes(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    productId?: number
  ): Promise<SizeListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    });

    if (productId) {
      params.append('product_id', productId.toString());
    }

    return this.request<SizeListResponse>(`/api/admin/sizes?${params}`);
  }

  async createSize(sizeData: SizeRequest): Promise<SizeResponse> {
    return this.request<SizeResponse>('/api/admin/sizes', {
      method: 'POST',
      body: JSON.stringify(sizeData),
    });
  }

  async getSize(id: number): Promise<SizeResponse> {
    return this.request<SizeResponse>(`/api/admin/sizes/${id}`);
  }

  async updateSize(id: number, sizeData: SizeRequest): Promise<SizeResponse> {
    return this.request<SizeResponse>(`/api/admin/sizes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sizeData),
    });
  }

  async deleteSize(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/admin/sizes/${id}`, {
      method: 'DELETE',
    });
  }

  // ProductVariant Management
  async listProductVariants(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    productId?: number,
    colorId?: number
  ): Promise<ProductVariantListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    });

    if (productId) {
      params.append('product_id', productId.toString());
    }

    if (colorId) {
      params.append('color_id', colorId.toString());
    }

    return this.request<ProductVariantListResponse>(`/api/admin/product-variants?${params}`);
  }

  async createProductVariant(variantData: ProductVariantRequest): Promise<ProductVariantResponse> {
    return this.request<ProductVariantResponse>('/api/admin/product-variants', {
      method: 'POST',
      body: JSON.stringify(variantData),
    });
  }

  async getProductVariant(id: number): Promise<ProductVariantResponse> {
    return this.request<ProductVariantResponse>(`/api/admin/product-variants/${id}`);
  }

  async updateProductVariant(id: number, variantData: ProductVariantRequest): Promise<ProductVariantResponse> {
    return this.request<ProductVariantResponse>(`/api/admin/product-variants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(variantData),
    });
  }

  async deleteProductVariant(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/admin/product-variants/${id}`, {
      method: 'DELETE',
    });
  }

  // Public API methods (no authentication required)
  async getPublicCategories(): Promise<CategoryListResponse> {
    const response = await fetch(`${this.baseUrl}/api/categories`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async getPublicProducts(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string[];
  } = {}): Promise<ProductListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.category && params.category.length > 0) {
      params.category.forEach(cat => searchParams.append('category', cat));
    }
    
    const url = `${this.baseUrl}/api/products${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async getPublicProduct(id: number): Promise<{
    product: ProductResponse;
    variants: ProductVariantResponse[];
    sizes: SizeResponse[];
  }> {
    const response = await fetch(`${this.baseUrl}/api/products/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);