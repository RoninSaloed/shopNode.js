import asyncHandler from "express-async-handler";
import { prisma } from "../config/prismaConfig";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET as string);

export const getAllThings = asyncHandler(async (req, res) => {
  const things = await prisma.thing.findMany();
  res.status(200).send({ message: "All things", things: things });
});

export const getThingById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const thing = await prisma.thing.findUnique({ where: { id: id } });
    res.status(200).send(thing);
  } catch (error: any) {
    res.status(500).send({ message: error.message });
  }
});

export const addToCartThing = asyncHandler(async (req, res, next) => {
  const { id: userId } = req.params;
  const { id: thingId } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).send({ message: "User not found" });
      return;
    }

    const thing = await prisma.thing.findUnique({ where: { id: thingId } });
    if (!thing) {
      res.status(404).send({ message: "Thing not found" });
      return;
    }

    const addToCart = await prisma.user.update({
      where: { id: userId },
      data: {
        cart: {
          push: thingId,
        },
      },
    });

    res.status(200).send({
      message: "Successful add thing",
      cart: addToCart.cart,
    });
  } catch (error) {
    next(error);
  }
});

export const removeFromCartThing = asyncHandler(async (req, res, next) => {
  const { id: userId } = req.params;
  const { id: thingId } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).send({ message: "User not found" });
      return;
    }

    const thing = await prisma.thing.findUnique({ where: { id: thingId } });
    if (!thing) {
      res.status(404).send({ message: "Thing not found" });
      return;
    }

    const addToCart = await prisma.user.update({
      where: { id: userId },
      data: {
        cart: user.cart.filter((id) => id !== thingId),
      },
    });

    res.status(200).send({
      message: "Successful removed thing",
      cart: addToCart.cart,
    });
  } catch (error) {
    next(error);
  }
});

export const removeThingById = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;
  const { id } = req.body;
  const isAdmin = await prisma.admin.findUnique({ where: { id: userId } });

  if (isAdmin) {
    try {
      const thing = await prisma.thing.delete({ where: { id: id } });
      res.status(200).send(thing);
    } catch (error: any) {
      res.status(500).send({ message: error.message });
    }
  } else {
    res.status(500).send({ message: "No access" });
  }
});

export const addThings = asyncHandler(async (req, res) => {
  const { id: userId, thingID, title, price } = req.params;
  const isAdmin = await prisma.admin.findUnique({ where: { id: userId } });

  if (isAdmin && thingID && title) {
    const thing = await prisma.thing.create({
      data: {
        id: thingID,
        title,
        price,
      },
    });
    res.status(200).send({ message: "Success created", thing });
  } else {
    res.status(500).send({ message: "No access" });
  }
});

export const purchaseThing = asyncHandler(async (req, res) => {
  const items: {
    price_data: {
      currency: string;
      product_data: { name: string };
      unit_amount: number;
    };
    quantity: number;
  }[] = [];
  const { id: userId } = req.params;
  const { thingID, title, price } = req.body;
  const itemList = () => {
    for (let i = 0; i < title.length; i++) {
      const element = {
        price_data: {
          currency: "usd",
          product_data: {
            name: title[i],
          },
          unit_amount: price[i] * 100,
        },
        quantity: 1,
      };
      items.push(element);
    }
    return items;
  };
  const session = await stripe.checkout.sessions.create({
    line_items: itemList(),
    mode: "payment",
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel",
  });
  console.log(session.url);
  res.redirect(session.url as string);
});
