/// <reference types="chrome-types" />
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { useState } from "react";

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}
function App() {
  const [input, setInput] = useState<string>("");

  const Collapse = async (filter: string[]) => {
    const tab = await getCurrentTab();
    chrome.scripting.executeScript({
      target: { tabId: tab?.id ?? 0, allFrames: true },
      func: (filter: string[]) => {
        const regexList = filter.map((pattern) => new RegExp(pattern));
        console.log({ regexList });
        const elements = [
          ...document.querySelectorAll("div.repos-summary-header"),
        ];

        const filteredElements = elements.filter((header) => {
          return [...header.querySelectorAll("span")].some((span) =>
            regexList.some((regex) => regex.test(span.textContent ?? ""))
          );
        });

        filteredElements.forEach((header) => {
          const collapseButton = header.querySelector(
            "button.bolt-card-expand-button"
          );
          collapseButton?.click();
        });
      },
      args: [filter], // Pass the regexList to the function
    });
  };

  const RenderButtons = () =>
    [".graphql.ts", ".gql", ".ts", ".tsx", ".cs"].map((value) => (
      <Button variant="outline" onClick={() => Collapse([value])} value={value}>
        {value}
      </Button>
    ));

  return (
    <div className="px-2 py-2 ring-1 shadow-xl space-y-2">
      <h1 className="text-2xl font-bold text-center">Devops file collapse</h1>
      <div className="flex w-full max-w-sm items-center space-x-2">
        {RenderButtons()}
      </div>

      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          color="white"
          placeholder="e.g., .graphql.ts"
          onChange={(e) => {
            setInput(e.target.value);
          }}
        />
        <Button onClick={() => Collapse([input])}>Collapse</Button>
      </div>
    </div>
  );
}
export default App;
