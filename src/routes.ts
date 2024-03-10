import express, { Express, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

function routes(app: Express) {
    app.post("/pogs", async (req: Request, res: Response) => {
        try {
            const { name, ticker_symbol, price, color } = req.body;
            const existingPog = await prisma.pogs.findUnique({
                where: { ticker_symbol },
            });
            if (existingPog) {
                return res.status(422).json({ error: "Ticker symbol already exists" });
            }
            const createdPog = await prisma.pogs.create({
                data: { name, ticker_symbol, price, color },
            });
            res.status(201).json(createdPog);
        } catch (error) {
            res.status(500).json({ error: "Failed to create pog" });
        }
    });

    app.get("/pogs", async (req: Request, res: Response) => {
        try {
            const pogs = await prisma.pogs.findMany();
            res.json(pogs);
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    });

    app.get("/pogs/:id", async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const pog = await prisma.pogs.findUnique({
                where: { id: parseInt(id) },
            });
            if (!pog) {
                return res.status(404).json({ error: "Pog not found" });
            }
            res.json(pog);
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    });

    app.patch("/pogs/:id", async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { name, ticker_symbol, price, color } = req.body;

            const existingPogWithTicker = await prisma.pogs.findFirst({
                where: {
                    ticker_symbol,
                    NOT: {
                        id: parseInt(id),
                    },
                },
            });
            if (existingPogWithTicker) {
                return res.status(422).json({ error: "Ticker symbol already exists" });
            }

            const updatedPog = await prisma.pogs.update({
                where: { id: parseInt(id) },
                data: { name, ticker_symbol, price, color },
            });
            res.json(updatedPog);
        } catch (error) {
            res.status(404).json({ error: "Pog not found or update failed" });
        }
    });

    app.delete("/pogs/:id", async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await prisma.pogs.delete({
                where: { id: parseInt(id) },
            });
            res.sendStatus(204);
        } catch (error) {
            res.status(404).json({ error: "Pog not found" });
        }
    });
}

export default routes;
