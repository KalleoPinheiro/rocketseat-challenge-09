import { Request, Response } from 'express';

import { container } from 'tsyringe';
import CreateProductService from '@modules/products/services/CreateProductService';
import AppError from '@shared/errors/AppError';

export default class ProductsController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { name, price, quantity } = request.body;

    if (!name || !price || !quantity) {
      throw new AppError('Name, price and quantity is required!');
    }

    const productService = container.resolve(CreateProductService);

    const product = await productService.execute({ name, price, quantity });

    return response.status(200).json(product);
  }
}
