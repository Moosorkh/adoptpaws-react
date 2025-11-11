export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  category: string;
  status: 'available' | 'pending' | 'adopted';
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateProductDTO {
  name: string;
  price: number;
  description: string;
  image_url: string;
  category: string;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  status?: 'available' | 'pending' | 'adopted';
}
