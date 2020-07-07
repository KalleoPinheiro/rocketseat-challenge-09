import { Request, Response } from 'express';

import CreateCustomerService from '@modules/customers/services/CreateCustomerService';

import { container } from 'tsyringe';
import AppError from '@shared/errors/AppError';

export default class CustomersController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { name, email } = request.body;

    if (!name || !email) {
      throw new AppError('Name and email is required!');
    }

    const customerService = container.resolve(CreateCustomerService);

    const customer = await customerService.execute({ name, email });

    return response.status(200).json(customer);
  }
}
