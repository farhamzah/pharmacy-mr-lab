import "./styles.css";
import { AppController } from "./app/AppController";

const root = document.getElementById("app");

if (!root) {
  throw new Error("Root element #app tidak ditemukan.");
}

const app = new AppController(root);
app.start();
