import { Request, Response } from 'express';

import { container } from 'tsyringe';

import CreateOrderService from '@modules/orders/services/CreateOrderService';
import FindOrderService from '@modules/orders/services/FindOrderService';
import AppError from '@shared/errors/AppError';

export default class OrdersController {
  public async show(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    if (!id) {
      throw new AppError('Id was needed!', 404);
    }

    const findOrderService = container.resolve(FindOrderService);

    const order = await findOrderService.execute({ id });

    return response.status(200).json(order);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const { customer_id, products } = request.body;

    const orderService = container.resolve(CreateOrderService);

    const order = await orderService.execute({ customer_id, products });

    return response.status(200).json(order);
  }
}
