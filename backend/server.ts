import bcrypt from "bcryptjs";
import cors from "cors";
import express, { Request, Response } from "express";
import fs from "fs";
import jwt from "jsonwebtoken";

const PORT = 5000;
const app = express();

app.use(express.json());
app.use(cors());

app.listen(PORT, () => console.log(`Server has started listening on ${PORT}`));

// Load user data from users.json (create the file if it doesn't exist)
let users: { email: string; password: string }[] = [];
interface Menu {
  name: string;
  price: number;
}
try {
  const userData = fs.readFileSync("./data/users.json", "utf-8");
  users = JSON.parse(userData);
} catch (error) {
  users = [];
}

const menus: Menu[] = [];

app.post("/register", (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  // Hash the password using bcryptjs
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const newUser = { email, password: hash };
  users.push(newUser);

  // Save the updated user list to users.json
  fs.writeFileSync("./data/users.json", JSON.stringify(users, null, 2));

  res.status(201).send({ email });
});

app.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  const user = users.find((user) => user.email === email);

  if (!user) {
    return res.status(401).send("User not found");
  }

  const passwordMatch = bcrypt.compareSync(password, user.password);

  if (!passwordMatch) {
    return res.status(401).send("Invalid credentials");
  }

  // Create and send a JWT token upon successful authentication
  const accessToken = jwt.sign({ email }, "EyCXSUHhVL5Xykn0QVix", {
    expiresIn: "1h",
  });
  res.status(200).send({ accessToken });
});

app.post("/menu", (req: Request, res: Response) => {
  const { name, price } = req.body;
  if (!name || price === undefined) {
    return res.status(400).send("Name and price are required.");
  }
  menus.push({ name, price });
  res.status(200).send({ menus });
});
