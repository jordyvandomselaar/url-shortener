import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';

const SALT_ROUNDS = 10;

export interface UpdateUserInput {
  email?: string;
  name?: string;
  password?: string;
}

export class UserService {
  async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            urls: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        urls: {
          include: {
            variants: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  async updateUser(id: string, input: UpdateUserInput) {
    const data: any = {};

    if (input.email) {
      // Check if email is already taken
      const existing = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existing && existing.id !== id) {
        throw new Error('Email already taken');
      }

      data.email = input.email;
    }

    if (input.name !== undefined) {
      data.name = input.name;
    }

    if (input.password) {
      data.password = await bcrypt.hash(input.password, SALT_ROUNDS);
    }

    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        updatedAt: true,
      },
    });
  }

  async deleteUser(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }

  async toggleAdmin(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return prisma.user.update({
      where: { id },
      data: {
        isAdmin: !user.isAdmin,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
      },
    });
  }
}

export const userService = new UserService();
