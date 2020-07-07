/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import { getRepository, In, Repository } from 'typeorm';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const findProduct = await this.ormRepository.findOne({ where: { name } });

    return findProduct;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const findProduct = await this.ormRepository.find({
      where: { id: In(products.map(product => product.id)) },
    });

    return findProduct;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    for (const product of products) {
      const findedProduct = (await this.ormRepository.findOne({
        where: { id: product.id },
      })) as Product;

      await this.ormRepository.update(findedProduct?.id, {
        quantity: Number(findedProduct?.quantity - product.quantity),
      });
    }

    const updatedProducts = await this.ormRepository.find({
      where: { id: In(products.map(prd => prd.id)) },
    });

    return updatedProducts;
  }
}

export default ProductsRepository;
