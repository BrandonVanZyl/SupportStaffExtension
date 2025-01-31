/// <reference types="chrome-types" />
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}
function App() {
  const Collapse = async () => {
    const tab = await getCurrentTab();
    chrome.scripting.executeScript({
      target: { tabId: tab?.id ?? 0, allFrames: true },
      func: (url: string) => {
        if (url.includes("/timesheets/daily/")) {
          console.log("This is a timesheet page");
          document
            .querySelectorAll<HTMLAnchorElement>("a")
            .forEach(async (link) => {
              if (/\/timesheets\/\d+/.test(link.href)) {
                let parent =
                  link.closest("a")?.parentElement?.parentElement
                    ?.parentElement;
                if (parent) {
                  if (parent.querySelector("#supportstaff-api-call")) return;

                  const button = document.createElement("button");
                  button.id = "supportstaff-api-call";
                  button.textContent = "Check in Support Staff";
                  button.onclick = async () => {
                    var response = await fetch(
                      "http://192.168.3.105:5054/ChromeExtension/FindShift/Single",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          date: url.split("/").pop(),
                          workforceTimesheetId: link.href.split("/").pop(),
                        }),
                      }
                    );
                    const result: string = await response.text();
                    if (response.ok) {
                      window.open(
                        `https://staging.supportstaffclock.in/organisation/278838/shifts/${result}`,
                        "_blank"
                      );
                    } else {
                      alert(result);
                    }
                  };

                  parent.appendChild(button);
                }
              }
            });
        } else {
          console.log("This is not a timesheet page");
        }
      },
      args: [tab?.url],
    });
  };

  return (
    <div>
      <button onClick={() => Collapse()}>View in Support Staff</button>
    </div>
  );
}
export default App;
