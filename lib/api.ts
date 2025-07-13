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
  use_stock: boolean;
  stock_quantity: number;
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
  use_stock: boolean;
  stock_quantity: number;
  reserved_quantity: number;
  available_stock: number;
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

// Cart interfaces
export interface CartItemRequest {
  product_id: number;
  variant_id: number;
  size_id: number;
  quantity: number;
  additional_service_ids: number[];
}

export interface CartItemUpdateRequest {
  quantity: number;
}

export interface CartItemResponse {
  id: number;
  product_id: number;
  product: ProductResponse;
  variant_id: number;
  variant: ProductVariantResponse;
  size_id: number;
  size: SizeResponse;
  quantity: number;
  price_per_item: number;
  total_price: number;
  additional_services: AdditionalServiceResponse[];
  created_at: string;
  updated_at: string;
}

export interface CartDiscount {
  code_id: number;
  code: string;
  description: string;
  discount_type: string;
  discount_value: number;
  discount_amount: number;
}

export interface CartResponse {
  items: CartItemResponse[];
  total_items: number;
  subtotal: number;
  discount_amount: number;
  total_price: number;
  applied_discount?: CartDiscount;
}

export interface CartCountResponse {
  count: number;
}

// Order interfaces
export interface AddressRequest {
  first_name: string;
  last_name: string;
  company?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  phone: string;
}

export interface OrderRequest {
  email: string;
  phone: string;
  shipping_address: AddressRequest;
  billing_address: AddressRequest;
  same_as_shipping: boolean;
  payment_method?: string;
  notes?: string;
  requires_invoice: boolean;
  nip?: string;
}

export interface ShippingAddressResponse {
  id: number;
  order_id: number;
  first_name: string;
  last_name: string;
  company?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  phone: string;
  created_at: string;
}

export interface BillingAddressResponse {
  id: number;
  order_id: number;
  first_name: string;
  last_name: string;
  company?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  phone: string;
  same_as_shipping: boolean;
  created_at: string;
}

export interface OrderItemServiceResponse {
  id: number;
  order_item_id: number;
  service_id: number;
  service_name: string;
  service_description?: string;
  service_price: number;
  created_at: string;
}

export interface OrderItemResponse {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_description?: string;
  variant_id: number;
  variant_name: string;
  variant_color_name?: string;
  variant_color_custom: boolean;
  size_id: number;
  size_name: string;
  size_dimensions?: { [key: string]: number };
  quantity: number;
  unit_price: number;
  total_price: number;
  main_image?: ImageResponse;
  services?: OrderItemServiceResponse[];
  created_at: string;
}

export interface OrderResponse {
  id: number;
  user_id?: number;
  session_id?: string;
  public_hash?: string;
  email: string;
  phone: string;
  status: string;
  total_amount: number;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_code_id?: number;
  discount_amount: number;
  discount_description?: string;
  payment_method?: string;
  payment_status: string;
  notes?: string;
  requires_invoice: boolean;
  nip?: string;
  shipping_address?: ShippingAddressResponse;
  billing_address?: BillingAddressResponse;
  items?: OrderItemResponse[];
  created_at: string;
  updated_at: string;
}

export interface OrderListResponse {
  orders: OrderResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface OrderStatusUpdateRequest {
  status: string;
}

// User Profile interfaces
export interface UserProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface UserProfileResponse {
  id: number;
  user_id: number;
  first_name?: string;
  last_name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  addresses: UserAddressResponse[] | null;
}

export interface UserAddressRequest {
  label: string;
  first_name: string;
  last_name: string;
  company?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
}

export interface UserAddressResponse {
  id: number;
  user_id: number;
  label: string;
  first_name: string;
  last_name: string;
  company?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserAddressListResponse {
  addresses: UserAddressResponse[];
  total: number;
}

export interface SearchResponse {
  products: ProductResponse[];
  total: number;
  page: number;
  limit: number;
  query: string;
  sort: string;
  suggestion?: string;
}

export interface SearchSuggestionsResponse {
  suggestions: string[];
  query: string;
}

// Discount interfaces
export interface ApplyDiscountRequest {
  code: string;
}

export interface ApplyDiscountResponse {
  code: string;
  description: string;
  discount_type: string;
  discount_value: number;
  discount_amount: number;
  original_total: number;
  discounted_total: number;
  message: string;
}

export interface DiscountCodeRequest {
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_order_amount: number;
  usage_type: 'one_time' | 'once_per_user' | 'unlimited';
  max_uses?: number;
  active: boolean;
  start_date: string; // Format: YYYY-MM-DDTHH:mm:ssZ
  end_date?: string; // Format: YYYY-MM-DDTHH:mm:ssZ
}

export interface DiscountCodeResponse {
  id: number;
  code: string;
  description: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  usage_type: string;
  max_uses?: number;
  used_count: number;
  active: boolean;
  start_date: string;
  end_date?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
  is_expired: boolean;
  is_usage_exceeded: boolean;
}

export interface DiscountCodeListResponse {
  discount_codes: DiscountCodeResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface DiscountCodeUsage {
  id: number;
  discount_code_id: number;
  user_id?: number;
  session_id: string;
  order_id?: number;
  created_at: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.initializeCleanup();
  }

  private initializeCleanup() {
    // Clean up any invalid tokens on initialization
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && !this.isValidTokenFormat(token)) {
        console.warn('Invalid token detected on initialization, clearing tokens');
        this.clearTokens();
      }
    }
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

    // Validate token format before sending
    if (token && this.isValidTokenFormat(token)) {
      headers.Authorization = `Bearer ${token}`;
    } else if (token) {
      // Clear invalid token
      console.warn('Invalid token format detected, clearing tokens');
      this.clearTokens();
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

      // Validate refresh token format
      if (!this.isValidTokenFormat(refreshToken)) {
        console.warn('Invalid refresh token format, clearing tokens');
        this.clearTokens();
        return false;
      }

      const response = await this.refreshToken(refreshToken);
      
      // Update stored tokens
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear tokens on refresh failure to prevent retry loops
      this.clearTokens();
      return false;
    }
  }

  private isValidTokenFormat(token: string): boolean {
    // Basic JWT format validation (3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Check if each part is base64-encoded (basic check)
    try {
      parts.forEach(part => {
        if (!part || part.length === 0) throw new Error('Empty part');
        // Try to decode base64 (will throw if invalid)
        atob(part.replace(/-/g, '+').replace(/_/g, '/'));
      });
      return true;
    } catch {
      return false;
    }
  }

  private clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private handleAuthFailure() {
    // Clear stored tokens
    this.clearTokens();
    
    // Only redirect if we're not already on login/register page
    if (typeof window !== 'undefined' && 
        !window.location.pathname.includes('/login') && 
        !window.location.pathname.includes('/register')) {
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

  // Search API methods
  async searchProducts(params: {
    q?: string;
    page?: number;
    limit?: number;
    sort?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'name';
    category?: string[];
  } = {}): Promise<SearchResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.q) searchParams.append('q', params.q);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.sort) searchParams.append('sort', params.sort);
    if (params.category && params.category.length > 0) {
      params.category.forEach(cat => searchParams.append('category', cat));
    }
    
    const url = `${this.baseUrl}/api/search${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async getSearchSuggestions(query: string, limit: number = 5): Promise<SearchSuggestionsResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);
    searchParams.append('limit', limit.toString());
    
    const url = `${this.baseUrl}/api/search/suggestions?${searchParams.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // Cart API methods
  async getCart(): Promise<CartResponse> {
    const response = await fetch(`${this.baseUrl}/api/cart`, {
      credentials: 'include', // Include cookies for session
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async addToCart(item: CartItemRequest): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/api/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session
      body: JSON.stringify(item),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async updateCartItem(id: number, update: CartItemUpdateRequest): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/api/cart/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session
      body: JSON.stringify(update),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async removeFromCart(id: number): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/api/cart/remove/${id}`, {
      method: 'DELETE',
      credentials: 'include', // Include cookies for session
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async clearCart(): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/api/cart/clear`, {
      method: 'POST',
      credentials: 'include', // Include cookies for session
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async getCartCount(): Promise<CartCountResponse> {
    const response = await fetch(`${this.baseUrl}/api/cart/count`, {
      credentials: 'include', // Include cookies for session
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // Discount API methods
  async applyDiscountToCart(request: ApplyDiscountRequest): Promise<ApplyDiscountResponse> {
    const response = await fetch(`${this.baseUrl}/api/cart/discount/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async removeDiscountFromCart(): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/api/cart/discount/remove`, {
      method: 'DELETE',
      credentials: 'include', // Include cookies for session
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // Order API methods
  async createOrder(order: OrderRequest): Promise<OrderResponse> {
    // Use authenticated request method that includes JWT tokens for logged-in users
    // while still supporting session cookies for guest users
    const response = await fetch(`${this.baseUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('access_token') ? {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        } : {}),
      },
      credentials: 'include', // Include cookies for session
      body: JSON.stringify(order),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async getOrder(id: number): Promise<OrderResponse> {
    const response = await fetch(`${this.baseUrl}/api/orders/${id}`, {
      headers: {
        ...(localStorage.getItem('access_token') ? {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        } : {}),
      },
      credentials: 'include', // Include cookies for session
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async getUserOrders(params: {
    page?: number;
    limit?: number;
  } = {}): Promise<OrderListResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    
    const endpoint = `/api/user/orders${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<OrderListResponse>(endpoint);
  }

  // Admin Order Management
  async listOrders(params: {
    page?: number;
    limit?: number;
    email?: string;
    status?: string;
  } = {}): Promise<OrderListResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.email) searchParams.append('email', params.email);
    if (params.status) searchParams.append('status', params.status);
    
    const endpoint = `/api/admin/orders${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<OrderListResponse>(endpoint);
  }

  async updateOrderStatus(id: number, statusUpdate: OrderStatusUpdateRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusUpdate),
    });
  }

  async deleteOrder(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/admin/orders/${id}`, {
      method: 'DELETE',
    });
  }

  // User Profile Management
  async getUserProfile(): Promise<UserProfileResponse> {
    return this.request<UserProfileResponse>('/api/user/profile');
  }

  async updateUserProfile(profileData: UserProfileRequest): Promise<UserProfileResponse> {
    return this.request<UserProfileResponse>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // User Address Management
  async getUserAddresses(): Promise<UserAddressListResponse> {
    return this.request<UserAddressListResponse>('/api/user/addresses');
  }

  async createUserAddress(addressData: UserAddressRequest): Promise<UserAddressResponse> {
    return this.request<UserAddressResponse>('/api/user/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async updateUserAddress(id: number, addressData: UserAddressRequest): Promise<UserAddressResponse> {
    return this.request<UserAddressResponse>(`/api/user/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  }

  async deleteUserAddress(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/user/addresses/${id}`, {
      method: 'DELETE',
    });
  }

  async setDefaultAddress(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/user/addresses/${id}/default`, {
      method: 'PATCH',
    });
  }

  // Admin Discount Code Management
  async listDiscountCodes(
    page: number = 1, 
    limit: number = 20, 
    active?: boolean
  ): Promise<DiscountCodeListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (active !== undefined) params.append('active', active.toString());
    
    return this.request<DiscountCodeListResponse>(`/api/admin/discount-codes?${params}`);
  }

  async createDiscountCode(discountData: DiscountCodeRequest): Promise<DiscountCodeResponse> {
    return this.request<DiscountCodeResponse>('/api/admin/discount-codes', {
      method: 'POST',
      body: JSON.stringify(discountData),
    });
  }

  async getDiscountCode(id: number): Promise<DiscountCodeResponse> {
    return this.request<DiscountCodeResponse>(`/api/admin/discount-codes/${id}`);
  }

  async updateDiscountCode(id: number, discountData: DiscountCodeRequest): Promise<DiscountCodeResponse> {
    return this.request<DiscountCodeResponse>(`/api/admin/discount-codes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(discountData),
    });
  }

  async deleteDiscountCode(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/admin/discount-codes/${id}`, {
      method: 'DELETE',
    });
  }

  async getDiscountCodeUsage(id: number): Promise<DiscountCodeUsage[]> {
    return this.request<DiscountCodeUsage[]>(`/api/admin/discount-codes/${id}/usage`);
  }

  // Public method to clear tokens manually
  public clearAuthTokens(): void {
    this.clearTokens();
  }

  // Public method to check if user has valid tokens
  public hasValidTokens(): boolean {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    return !!(accessToken && this.isValidTokenFormat(accessToken) && 
              refreshToken && this.isValidTokenFormat(refreshToken));
  }
}

export const apiClient = new ApiClient(API_BASE_URL);