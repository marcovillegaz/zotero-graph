import { JsonAdapter } from "../adapters/json-adapter";
import { mountView } from "./main";

void mountView(document.getElementById("app")!, new JsonAdapter("/library.json"));
