/* eslint-disable no-restricted-syntax */
import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import IOrdersRepository from '../repositories/IOrdersRepository';
import Order from '../infra/typeorm/entities/Order';

interface IProductOrder {
  product_id: string;
  price: number;
  quantity: number;
}

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrderRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomerRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);
    const orderProducts: IProductOrder[] = [];

    if (!customer) {
      throw new AppError('Customer does not exists!', 400);
    }

    const productsId = products.map(prd => {
      return {
        id: `${prd.id}`,
      };
    });

    const productsData = await this.productsRepository.findAllById(productsId);

    for (const orderProduct of products) {
      const productExists = productsData.find(
        findedProduct => findedProduct.id === orderProduct.id,
      );

      if (!productExists) {
        throw new AppError(
          `Product with id: ${orderProduct.id} does not exists!`,
          400,
        );
      }

      if (productExists.quantity < orderProduct.quantity) {
        throw new AppError(
          `Product with id: ${orderProduct.id} does not have enough quantity!`,
          400,
        );
      }

      orderProducts.push({
        product_id: productExists.id,
        price: productExists.price,
        quantity: orderProduct.quantity,
      });
    }

    const order = await this.ordersRepository.create({
      customer,
      products: orderProducts,
    });

    if (!order) {
      throw new AppError('Failed to create order!', 404);
    }

    await this.productsRepository.updateQuantity(products);

    return order;
  }
}

export default CreateOrderService;
