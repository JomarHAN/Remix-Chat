import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type TypeUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export const createUser = async (data: any) => {
  try {
    const user = await prisma.user.create({
      data: {
        id: 1,
        email: data.email,
        firstName: data.firstName,
        phone: data.phone,
        lastName: data.lastName,
      },
    });
    return user;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create user");
  }
};
