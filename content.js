// Zone01 Time Tracker Content Script
(() => {
  // Helper function to parse time string (HH:MM:SS) to total seconds
  function timeToSeconds(timeStr) {
    if (!timeStr || timeStr.trim() === "") return 0;

    const parts = timeStr.split(":");
    if (parts.length !== 3) return 0;

    const hours = Number.parseInt(parts[0], 10) || 0;
    const minutes = Number.parseInt(parts[1], 10) || 0;
    const seconds = Number.parseInt(parts[2], 10) || 0;

    return hours * 3600 + minutes * 60 + seconds;
  }

  // Helper function to convert seconds back to HH:MM:SS format
  function secondsToTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  // Helper function to calculate time difference between two time strings (same day)
  function calculateTimeDifference(startTime, endTime) {
    const startSeconds = timeToSeconds(startTime);
    const endSeconds = timeToSeconds(endTime);

    if (endSeconds >= startSeconds) {
      return endSeconds - startSeconds;
    }
    // Handle case where end time is next day (add 24 hours)
    return endSeconds + 24 * 3600 - startSeconds;
  }

  // Helper function to get current time in HH:MM:SS format
  function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }

  // Helper function to check if a date is today
  function isToday(dateStr) {
    const today = new Date();
    const checkDate = new Date(dateStr);

    return today.getFullYear() === checkDate.getFullYear() && today.getMonth() === checkDate.getMonth() && today.getDate() === checkDate.getDate();
  }

  // Enhanced function to find logs table with multiple fallback methods
  function findLogsTable() {
    console.log("Zone01 Time Tracker: Searching for logs table...");

    // Method 1: Try by ID
    const logsTableBody = document.getElementById("tbodyLogs");
    if (logsTableBody) {
      console.log("Zone01 Time Tracker: Found logs table by ID");
      return logsTableBody;
    }

    // Method 2: Try to find table with "Logs" text nearby
    const tables = document.querySelectorAll("table");
    for (const table of tables) {
      const tbody = table.querySelector("tbody");
      if (tbody) {
        // Check if this table has the expected column structure
        const headerRow = table.querySelector("thead tr");
        if (headerRow) {
          const headers = Array.from(headerRow.querySelectorAll("th")).map((th) => th.textContent.trim().toLowerCase());
          if (headers.includes("date") && headers.includes("enter time")) {
            console.log("Zone01 Time Tracker: Found logs table by header structure");
            return tbody;
          }
        }
      }
    }

    // Method 3: Look for table near "Logs" text
    const logsText = Array.from(document.querySelectorAll("p")).find((p) => p.textContent.trim() === "Logs");
    if (logsText) {
      const nextTable = logsText.nextElementSibling;
      if (nextTable && nextTable.tagName === "DIV") {
        const tbody = nextTable.querySelector("tbody");
        if (tbody) {
          console.log("Zone01 Time Tracker: Found logs table after 'Logs' text");
          return tbody;
        }
      }
    }

    // Method 4: Find table with logTable ID
    const logTable = document.getElementById("logTable");
    if (logTable) {
      const tbody = logTable.querySelector("tbody");
      if (tbody) {
        console.log("Zone01 Time Tracker: Found logs table by logTable ID");
        return tbody;
      }
    }

    console.log("Zone01 Time Tracker: Could not find logs table");
    return null;
  }

  // Enhanced function to find stats table
  function findStatsTable() {
    console.log("Zone01 Time Tracker: Searching for stats table...");

    // Method 1: Try by ID
    const statsTableBody = document.getElementById("tbodyStats");
    if (statsTableBody) {
      console.log("Zone01 Time Tracker: Found stats table by ID");
      return statsTableBody;
    }

    // Method 2: Look for table with "Heures plateformes" header
    const tables = document.querySelectorAll("table");
    for (const table of tables) {
      const headerRow = table.querySelector("thead tr");
      if (headerRow) {
        const headers = Array.from(headerRow.querySelectorAll("th")).map((th) => th.textContent.trim().toLowerCase());
        if (headers.includes("heures plateformes")) {
          const tbody = table.querySelector("tbody");
          if (tbody) {
            console.log("Zone01 Time Tracker: Found stats table by 'Heures plateformes' header");
            return tbody;
          }
        }
      }
    }

    console.log("Zone01 Time Tracker: Could not find stats table");
    return null;
  }

  // Function to check if tables have content
  function tablesHaveContent() {
    const logsTable = findLogsTable();
    const statsTable = findStatsTable();

    if (!logsTable || !statsTable) {
      return false;
    }

    const logsRows = logsTable.querySelectorAll("tr");
    const statsRows = statsTable.querySelectorAll("tr");

    console.log(`Zone01 Time Tracker: Found ${logsRows.length} log rows and ${statsRows.length} stats rows`);

    return logsRows.length > 0 && statsRows.length > 0;
  }

  // Function to wait for tables to be populated
  function waitForTables(callback, maxAttempts = 30) {
    let attempts = 0;

    function checkTables() {
      attempts++;
      console.log(`Zone01 Time Tracker: Checking for tables (attempt ${attempts}/${maxAttempts})`);

      if (tablesHaveContent()) {
        console.log("Zone01 Time Tracker: Tables found with content!");
        callback();
        return;
      }

      if (attempts >= maxAttempts) {
        console.log("Zone01 Time Tracker: Timeout waiting for tables to load");
        return;
      }

      setTimeout(checkTables, 1000); // Check every second
    }

    checkTables();
  }

  // Main function to calculate and update platform hours
  function updatePlatformHours() {
    try {
      console.log("Zone01 Time Tracker: Starting update...");
      console.log("Zone01 Time Tracker: Current URL:", window.location.href);
      console.log("Zone01 Time Tracker: Document ready state:", document.readyState);

      // Find the logs table body
      const logsTableBody = findLogsTable();
      if (!logsTableBody) {
        console.log("Zone01 Time Tracker: Logs table not found");
        // List all tables for debugging
        const allTables = document.querySelectorAll("table");
        console.log(`Zone01 Time Tracker: Found ${allTables.length} tables on page`);
        allTables.forEach((table, index) => {
          const tbody = table.querySelector("tbody");
          const rowCount = tbody ? tbody.querySelectorAll("tr").length : 0;
          console.log(`Zone01 Time Tracker: Table ${index}: ${rowCount} rows`);
        });
        return;
      }

      // Find the stats table body
      const statsTableBody = findStatsTable();
      if (!statsTableBody) {
        console.log("Zone01 Time Tracker: Stats table not found");
        return;
      }

      let totalSeconds = 0;
      let ongoingSessionSeconds = 0; // Track only ongoing sessions for total hours
      const rows = logsTableBody.querySelectorAll("tr");

      console.log(`Zone01 Time Tracker: Processing ${rows.length} log entries`);

      rows.forEach((row, index) => {
        const cells = row.querySelectorAll("td");
        console.log(`Zone01 Time Tracker: Row ${index}: ${cells.length} cells`);

        if (cells.length >= 4) {
          const date = cells[0].textContent.trim();
          const enterTime = cells[1].textContent.trim();
          const exitTime = cells[2].textContent.trim();
          const timeIn = cells[3].textContent.trim();

          console.log(`Zone01 Time Tracker: Row ${index}: Date=${date}, Enter=${enterTime}, Exit=${exitTime}, TimeIn=${timeIn}`);

          if (timeIn && timeIn !== "") {
            // Use existing time in value for platform hours
            const seconds = timeToSeconds(timeIn);
            totalSeconds += seconds;
            console.log(`Zone01 Time Tracker: Added existing time: ${timeIn} (${seconds} seconds)`);
          } else if (enterTime && enterTime !== "" && !exitTime) {
            // Calculate time from enter time to current time (only for ongoing sessions)
            if (isToday(date)) {
              const currentTime = getCurrentTime();
              const calculatedSeconds = calculateTimeDifference(enterTime, currentTime);
              const calculatedTimeStr = secondsToTime(calculatedSeconds);

              // Update the Time In cell for this row
              const timeInCell = cells[3];
              timeInCell.textContent = calculatedTimeStr;
              timeInCell.style.fontStyle = "italic";
              timeInCell.style.color = "#4ade80"; // Bright green color for dark mode
              timeInCell.title = "Live calculation - updates in real-time";
              timeInCell.setAttribute("data-live-calculation", "true");
              timeInCell.setAttribute("data-enter-time", enterTime);
              timeInCell.setAttribute("data-date", date);

              totalSeconds += calculatedSeconds;
              ongoingSessionSeconds += calculatedSeconds; // Track ongoing session time separately
              console.log(
                `Zone01 Time Tracker: Calculated and updated time for today: ${enterTime} to ${currentTime} = ${calculatedTimeStr} (${calculatedSeconds} seconds)`
              );
            } else {
              console.log(`Zone01 Time Tracker: Skipping non-today entry without time in: ${date}`);
            }
          }
        }
      });

      // Update the platform hours cell
      const statsRow = statsTableBody.querySelector("tr");
      if (statsRow) {
        // First, ensure the remaining hours column exists
        addRemainingHoursColumn();

        const platformHoursCell = statsRow.querySelector("td:first-child");
        const totalHoursCell = statsRow.querySelector("td:nth-child(2)");
        const remainingHoursCell = statsRow.querySelector('td[data-tracker-column="remaining"]');

        if (platformHoursCell) {
          const newTimeStr = secondsToTime(totalSeconds);
          const oldValue = platformHoursCell.textContent.trim();

          platformHoursCell.textContent = newTimeStr;
          // platformHoursCell.style.backgroundColor = "#e8f5e8";
          platformHoursCell.style.fontWeight = "bold";
          platformHoursCell.style.color = "#4ade80"; // Bright green color for dark mode
          platformHoursCell.title = "Updated by Zone01 Time Tracker";

          console.log(`Zone01 Time Tracker: Updated platform hours from ${oldValue} to ${newTimeStr} (${totalSeconds} total seconds)`);

          // Update the total hours column by adding ongoing session time to original value
          if (totalHoursCell) {
            const originalTotalHours = totalHoursCell.textContent.trim();

            // Store original value if not already stored
            if (!totalHoursCell.getAttribute("data-original-total")) {
              totalHoursCell.setAttribute("data-original-total", originalTotalHours);
            }

            const originalTotalSeconds = timeToSeconds(originalTotalHours);
            const newTotalSeconds = originalTotalSeconds + ongoingSessionSeconds;
            const newTotalTimeStr = secondsToTime(newTotalSeconds);

            totalHoursCell.textContent = newTotalTimeStr;
            totalHoursCell.style.fontWeight = "bold";
            totalHoursCell.style.color = "#4ade80"; // Bright green color for dark mode
            totalHoursCell.title = "Updated by Zone01 Time Tracker (original + ongoing sessions)";
            console.log(
              `Zone01 Time Tracker: Updated total hours from ${originalTotalHours} to ${newTotalTimeStr} (added ${secondsToTime(
                ongoingSessionSeconds
              )} ongoing time)`
            );
          }

          // Update the remaining hours column
          if (remainingHoursCell) {
            const remainingTimeStr = calculateRemainingHours(newTimeStr);
            remainingHoursCell.textContent = remainingTimeStr;
            remainingHoursCell.style.fontWeight = "bold";
            remainingHoursCell.style.color = "#4ade80";
            remainingHoursCell.title = "Updated by Zone01 Time Tracker";
            console.log(`Zone01 Time Tracker: Updated remaining hours to ${remainingTimeStr}`);
          }

          // Show persistent indicator that the extension is working
          showPersistentIndicator();

          // Show update frequency indicator
          showUpdateFrequencyIndicator();
        } else {
          console.log("Zone01 Time Tracker: Platform hours cell not found in stats table");
        }
      } else {
        console.log("Zone01 Time Tracker: Stats row not found");
      }
    } catch (error) {
      console.error("Zone01 Time Tracker: Error updating platform hours:", error);
    }
  }

  // Set up MutationObserver to watch for DOM changes
  function setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;

      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          // Check if any added nodes contain tables
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === "TABLE" || node.querySelector("table")) {
                shouldUpdate = true;
              }
            }
          }
        }
      }

      if (shouldUpdate) {
        console.log("Zone01 Time Tracker: DOM change detected, checking for tables...");
        setTimeout(() => {
          if (tablesHaveContent()) {
            updatePlatformHours();
          }
        }, 500);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    console.log("Zone01 Time Tracker: MutationObserver set up");
  }

  // Wait for page to be fully loaded and run the update
  function init() {
    console.log("Zone01 Time Tracker: Initializing...");

    // Set up mutation observer to watch for dynamic content
    setupMutationObserver();

    function startWaiting() {
      console.log("Zone01 Time Tracker: Starting to wait for tables...");
      waitForTables(() => {
        updatePlatformHours();
        // Set up regular full updates every 60 seconds
        setInterval(updatePlatformHours, 60000);
        // Set up frequent live calculation updates every 10 seconds
        setInterval(updateLiveCalculations, 10000);
        console.log("Zone01 Time Tracker: Set up live calculation updates every 10 seconds");
      });
    }

    if (document.readyState === "loading") {
      console.log("Zone01 Time Tracker: Document still loading, waiting for DOMContentLoaded");
      document.addEventListener("DOMContentLoaded", () => {
        console.log("Zone01 Time Tracker: DOMContentLoaded fired");
        setTimeout(startWaiting, 1000);
      });
    } else {
      console.log("Zone01 Time Tracker: Document already loaded");
      setTimeout(startWaiting, 1000);
    }
  }

  // Initialize the extension
  init();

  console.log("Zone01 Time Tracker: Content script loaded and initialized");

  // Function to update only the live time calculations (more frequent updates)
  function updateLiveCalculations() {
    try {
      const liveCells = document.querySelectorAll('[data-live-calculation="true"]');

      if (liveCells.length === 0) {
        return; // No live calculations to update
      }

      console.log(`Zone01 Time Tracker: Updating ${liveCells.length} live calculations`);

      for (const cell of liveCells) {
        const enterTime = cell.getAttribute("data-enter-time");
        const date = cell.getAttribute("data-date");

        if (enterTime && date && isToday(date)) {
          const currentTime = getCurrentTime();
          const calculatedSeconds = calculateTimeDifference(enterTime, currentTime);
          const calculatedTimeStr = secondsToTime(calculatedSeconds);

          // Update the cell if the value has changed
          if (cell.textContent !== calculatedTimeStr) {
            cell.textContent = calculatedTimeStr;

            // Add a subtle color flash animation to show the update
            const originalColor = cell.style.color;
            cell.style.transition = "color 0.3s ease";
            cell.style.color = "#22d3ee"; // Bright cyan flash
            setTimeout(() => {
              cell.style.color = originalColor; // Back to original bright green
            }, 300);
          }
        }
      }

      // Also update the platform hours when live calculations change
      updatePlatformHoursOnly();
    } catch (error) {
      console.error("Zone01 Time Tracker: Error updating live calculations:", error);
    }
  }

  // Function to update only the platform hours total (without full table re-scan)
  function updatePlatformHoursOnly() {
    try {
      const statsTableBody = findStatsTable();
      if (!statsTableBody) return;

      const logsTableBody = findLogsTable();
      if (!logsTableBody) return;

      let totalSeconds = 0;
      const rows = logsTableBody.querySelectorAll("tr");

      for (const row of rows) {
        const cells = row.querySelectorAll("td");
        if (cells.length >= 4) {
          const timeInCell = cells[3];
          const timeIn = timeInCell.textContent.trim();

          if (timeIn && timeIn !== "") {
            const seconds = timeToSeconds(timeIn);
            totalSeconds += seconds;
          }
        }
      }

      // Update the platform hours cell
      const statsRow = statsTableBody.querySelector("tr");
      if (statsRow) {
        const platformHoursCell = statsRow.querySelector("td:first-child");
        const totalHoursCell = statsRow.querySelector("td:nth-child(2)");
        const remainingHoursCell = statsRow.querySelector('td[data-tracker-column="remaining"]');

        if (platformHoursCell) {
          const newTimeStr = secondsToTime(totalSeconds);
          platformHoursCell.textContent = newTimeStr;
          platformHoursCell.style.fontWeight = "bold";
          platformHoursCell.style.color = "#4ade80"; // Bright green color for dark mode
          platformHoursCell.title = "Updated by Zone01 Time Tracker";

          // Calculate ongoing session time for total hours
          if (totalHoursCell) {
            // Get the original total hours value (we need to store it somewhere or recalculate)
            // For now, we'll update total hours with the same logic as main function
            const liveCells = document.querySelectorAll('[data-live-calculation="true"]');
            let ongoingSeconds = 0;

            for (const cell of liveCells) {
              const timeValue = cell.textContent.trim();
              if (timeValue) {
                ongoingSeconds += timeToSeconds(timeValue);
              }
            }

            // We need to get the original total hours somehow - let's use data attribute
            const originalTotal = totalHoursCell.getAttribute("data-original-total");
            if (originalTotal) {
              const originalSeconds = timeToSeconds(originalTotal);
              const newTotalSeconds = originalSeconds + ongoingSeconds;
              const newTotalTimeStr = secondsToTime(newTotalSeconds);

              totalHoursCell.textContent = newTotalTimeStr;
              totalHoursCell.style.fontWeight = "bold";
              totalHoursCell.style.color = "#4ade80";
              totalHoursCell.title = "Updated by Zone01 Time Tracker (original + ongoing sessions)";
            }
          }

          // Update the remaining hours column
          if (remainingHoursCell) {
            const remainingTimeStr = calculateRemainingHours(newTimeStr);
            remainingHoursCell.textContent = remainingTimeStr;
            remainingHoursCell.style.fontWeight = "bold";
            remainingHoursCell.style.color = "#4ade80";
            remainingHoursCell.title = "Updated by Zone01 Time Tracker";
          }
        }
      }
    } catch (error) {
      console.error("Zone01 Time Tracker: Error updating platform hours only:", error);
    }
  }

  // Function to show persistent indicator that the extension is working
  function showPersistentIndicator() {
    // Only create if it doesn't exist
    if (document.getElementById("zone01-tracker-wrapper")) {
      return;
    }

    // Find the date selector to position the indicator next to it
    const dateSelector = document.getElementById("selectorDate");
    if (!dateSelector) {
      console.log("Zone01 Time Tracker: Date selector not found, using fallback position");
      // Fallback to body if date selector not found
      createIndicator(document.body, true);
      return;
    }

    // Find the parent container of the date selector
    const cardFilter = dateSelector.closest(".card-filter");
    if (cardFilter) {
      createIndicator(cardFilter, false);
    } else {
      // Fallback: insert after date selector
      createIndicator(dateSelector.parentNode, false);
    }
  }

  // Helper function to create the indicator element
  function createIndicator(parent, useFixed) {
    // Create a wrapper container to keep both indicators together
    const indicatorWrapper = document.createElement("div");
    indicatorWrapper.id = "zone01-tracker-wrapper";
    indicatorWrapper.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    `;

    const indicator = document.createElement("div");
    indicator.id = "zone01-tracker-indicator";

    if (useFixed) {
      // Fixed position fallback
      indicatorWrapper.style.cssText += `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 10000;
      `;
      indicator.style.cssText = `
        background: #4ade80;
        color: #1f2937;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(74, 222, 128, 0.3);
        border: 1px solid #22c55e;
      `;
    } else {
      // Inline position next to date selector
      indicator.style.cssText = `
        display: inline-block;
        background: #4ade80;
        color: #1f2937;
        padding: 4px 10px;
        border-radius: 15px;
        font-size: 11px;
        font-weight: 600;
        box-shadow: 0 1px 4px rgba(74, 222, 128, 0.3);
        border: 1px solid #22c55e;
        vertical-align: middle;
      `;
      indicatorWrapper.style.cssText += `
        margin-left: 10px;
      `;
    }

    indicator.textContent = "✓ Real-time Extension Active";
    indicator.title = "Zone01 Time Tracker is calculating and updating your hours in real-time";

    indicatorWrapper.appendChild(indicator);
    parent.appendChild(indicatorWrapper);
    console.log("Zone01 Time Tracker: Persistent indicator created");
  }

  // Function to add "Remaining hours" column to the stats table
  function addRemainingHoursColumn() {
    try {
      const statsTable = document.querySelector("#tbodyStats").closest("table");
      if (!statsTable) {
        console.log("Zone01 Time Tracker: Stats table not found for adding column");
        return;
      }

      // Check if column already exists
      if (statsTable.querySelector('th[data-tracker-column="remaining"]')) {
        return; // Already added
      }

      // Add header cell
      const headerRow = statsTable.querySelector("thead tr");
      if (headerRow) {
        const remainingHeader = document.createElement("th");
        remainingHeader.textContent = "Remaining hours";
        remainingHeader.setAttribute("data-tracker-column", "remaining");
        remainingHeader.style.color = "#4ade80";
        remainingHeader.style.fontWeight = "bold";
        remainingHeader.title = "Hours remaining to reach 35 hours (calculated by Time Tracker)";

        // Insert after "Total heures" column (3rd column)
        const totalHoursHeader = headerRow.children[1]; // Second column is "Total heures"
        if (totalHoursHeader?.nextSibling) {
          headerRow.insertBefore(remainingHeader, totalHoursHeader.nextSibling);
        } else {
          headerRow.appendChild(remainingHeader);
        }

        console.log("Zone01 Time Tracker: Added 'Remaining hours' header");
      }

      // Add body cell
      const bodyRow = statsTable.querySelector("tbody tr");
      if (bodyRow) {
        const remainingCell = document.createElement("td");
        remainingCell.setAttribute("data-tracker-column", "remaining");
        remainingCell.style.color = "#4ade80";
        remainingCell.style.fontWeight = "bold";
        remainingCell.title = "Updated by Zone01 Time Tracker";
        remainingCell.textContent = "35:00:00"; // Default value

        // Insert after "Total heures" column (3rd column)
        const totalHoursCell = bodyRow.children[1]; // Second column is "Total heures"
        if (totalHoursCell?.nextSibling) {
          bodyRow.insertBefore(remainingCell, totalHoursCell.nextSibling);
        } else {
          bodyRow.appendChild(remainingCell);
        }

        console.log("Zone01 Time Tracker: Added 'Remaining hours' cell");
      }
    } catch (error) {
      console.error("Zone01 Time Tracker: Error adding remaining hours column:", error);
    }
  }

  // Function to calculate remaining hours (35:00:00 - total hours)
  function calculateRemainingHours(totalTimeStr) {
    const totalSeconds = timeToSeconds(totalTimeStr);
    const targetSeconds = 35 * 3600; // 35 hours in seconds
    const remainingSeconds = Math.max(0, targetSeconds - totalSeconds); // Don't go negative

    return secondsToTime(remainingSeconds);
  }

  // Function to show update frequency indicator near the stats table
  function showUpdateFrequencyIndicator() {
    // Only create if it doesn't exist
    if (document.getElementById("zone01-update-frequency")) {
      return;
    }

    // Find the persistent indicator to position the frequency text under it
    const persistentIndicator = document.getElementById("zone01-tracker-wrapper");
    if (!persistentIndicator) {
      console.log("Zone01 Time Tracker: Persistent indicator not found, cannot position frequency indicator");
      return;
    }

    // Create the frequency indicator
    const frequencyIndicator = document.createElement("div");
    frequencyIndicator.id = "zone01-update-frequency";
    frequencyIndicator.style.cssText = `
      font-size: 10px;
      color: #4ade80;
      font-style: italic;
      opacity: 0.8;
      display: flex;
      align-items: center;
      gap: 4px;
      justify-content: center;
    `;

    // Add a small animated dot to show it's live
    const animatedDot = document.createElement("span");
    animatedDot.style.cssText = `
      width: 5px;
      height: 5px;
      background: #4ade80;
      border-radius: 50%;
      animation: pulse 2s infinite;
      display: inline-block;
    `;

    // Add CSS animation for the pulsing dot
    if (!document.getElementById("zone01-pulse-animation")) {
      const style = document.createElement("style");
      style.id = "zone01-pulse-animation";
      style.textContent = `
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
      `;
      document.head.appendChild(style);
    }

    frequencyIndicator.appendChild(animatedDot);

    const text = document.createElement("span");
    text.textContent = "Updates every 10s";
    frequencyIndicator.appendChild(text);

    // Append directly to the wrapper container
    persistentIndicator.appendChild(frequencyIndicator);
    console.log("Zone01 Time Tracker: Update frequency indicator created inside wrapper");
  }
})();
