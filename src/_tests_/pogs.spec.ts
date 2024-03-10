import { prisma } from "../routes";
import createServer from "../utils/server";
import supertest from "supertest";

const app = createServer();

describe("Pogs", () => {
  afterEach(async () => {
    await prisma.pogs.deleteMany();
  });

  describe("show all pogs", () => {
    it("should return all pogs", async () => {
      //setup
      await prisma.pogs.createMany({
        data: [
          {
            name: "Sleighers",
            ticker_symbol: "SL",
            price: 150,
            color: "pink",
          },
          {
            name: "NoCap",
            ticker_symbol: "NC",
            price: 120,
            color: "blue",
          },
        ],
      });

      //invocation
      const res = await supertest(app).get("/pogs");

      //assessment
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it("should return an empty array if no pogs exist", async () => {

      const res = await supertest(app).get("/pogs");
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe("create a pog", () => {
    it("should create a new pog", async () => {
      //setup
      const pogData = {
        name: "Sleighers",
        ticker_symbol: "SL",
        price: 150,
        color: "pink",
      };

      //invocation
      const res = await supertest(app).post("/pogs").send(pogData);

      //assessment
      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject(pogData);
    });

    it("should not allow creation of a pog with duplicate ticker symbol", async () => {
      //setup
      await prisma.pogs.create({
        data: {
          name: "Existing Pog",
          ticker_symbol: "SL", // Existing ticker symbol
          price: 100,
          color: "red",
        },
      });

      const duplicatePogData = {
        name: "Duplicate Pog",
        ticker_symbol: "SL", // Attempt to create with existing ticker symbol
        price: 120,
        color: "blue",
      };

      //invocation
      const res = await supertest(app).post("/pogs").send(duplicatePogData);

      //assessment
      expect(res.statusCode).toBe(422);
    });
  });

  describe("update a pog", () => {
    it("should update an existing pog", async () => {
      //setup
      const createdPog = await prisma.pogs.create({
        data: {
          name: "Sleighers",
          ticker_symbol: "SL",
          price: 150,
          color: "pink",
        },
      });
      const updatedPogData = {
        name: "Updated Sleighers",
        ticker_symbol: "UPS",
        price: 180,
        color: "orange",
      };

      //invocation
      const res = await supertest(app)
        .patch(`/pogs/${createdPog.id}`)
        .send(updatedPogData);

      //assessment
      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject(updatedPogData);
    });

    it("should not allow update of a pog with duplicate ticker symbol", async () => {
      //setup
      const existingPog = await prisma.pogs.create({
        data: {
          name: "Existing Pog",
          ticker_symbol: "ExistingTicker",
          price: 150,
          color: "pink",
        },
      });

      await prisma.pogs.create({
        data: {
          name: "Another Pog",
          ticker_symbol: "AnotherTicker",
          price: 200,
          color: "blue",
        },
      });

      const duplicateTickerPogData = {
        name: "Duplicate Pog",
        ticker_symbol: "AnotherTicker", // Attempt to update with existing ticker symbol
        price: 180,
        color: "orange",
      };

      //invocation
      const res = await supertest(app)
        .patch(`/pogs/${existingPog.id}`)
        .send(duplicateTickerPogData);

      //assessment
      expect(res.statusCode).toBe(422);
    });
  });

  describe("delete a pog", () => {
    it("should delete an existing pog", async () => {
      //setup
      const createdPog = await prisma.pogs.create({
        data: {
          name: "Sleighers",
          ticker_symbol: "SL",
          price: 150,
          color: "pink",
        },
      });

      //invocation
      const res = await supertest(app).delete(`/pogs/${createdPog.id}`);

      //assessment
      expect(res.statusCode).toBe(204);
      expect(res.body).toEqual({});
    });

    it("should verify a pog is deleted from the database", async () => {
      const createdPog = await prisma.pogs.create({
        data: {
          name: "Omcm",
          ticker_symbol: "OM",
          price: 200,
          color: "yellow",
        },
      });
  
      await supertest(app).delete(`/pogs/${createdPog.id}`);
  
      const pogInDb = await prisma.pogs.findUnique({
        where: { id: createdPog.id },
      });
  
      expect(pogInDb).toBeNull();
    });
  });
});
