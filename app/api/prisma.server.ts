import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type TypeUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
};

export const createUser = async (data: TypeUser) => {
  try {
    const user = await prisma.user.create({
      data: {
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
      },
    });
    return user;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create user");
  }
};
