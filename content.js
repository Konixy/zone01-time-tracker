// Zone01 Time Tracker Content Script - Updated for New Layout
(() => {
  // Helper function to parse time string (HH:MM:SS or HH:MM) to total seconds
  function timeToSeconds(timeStr) {
    if (!timeStr || timeStr.trim() === "" || timeStr.trim() === "-") return 0;

    const parts = timeStr.split(":");
    if (parts.length < 2 || parts.length > 3) return 0;

    const hours = Number.parseInt(parts[0], 10) || 0;
    const minutes = Number.parseInt(parts[1], 10) || 0;
    const seconds = parts.length === 3 ? Number.parseInt(parts[2], 10) || 0 : 0;

    return hours * 3600 + minutes * 60 + seconds;
  }

  // Helper function to convert seconds back to HH:MM format (for calendar display)
  function secondsToTimeShort(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }

  // Helper function to convert seconds back to HH:MM:SS format (for logs display)
  function secondsToTimeLong(totalSeconds) {
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

  // Helper function to convert date from YYYY-MM-DD to DD/MM format
  function formatDateForCalendar(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${day}/${month}`;
  }

  // Helper function to parse DD/MM format and return full date string
  function parseCalendarDate(dayStr, year) {
    const [day, month] = dayStr.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // Helper function to mix two colors
  function mixColors(color1, color2, ratio = 0.5) {
    // Convert hex colors to RGB
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: Number.parseInt(result[1], 16),
            g: Number.parseInt(result[2], 16),
            b: Number.parseInt(result[3], 16),
          }
        : { r: 0, g: 0, b: 0 };
    };

    // Extract RGB from computed style or hex
    const parseColor = (color) => {
      if (color.startsWith("#")) {
        return hexToRgb(color);
      }
      if (color.startsWith("rgb")) {
        const match = color.match(/\d+/g);
        return match
          ? {
              r: Number.parseInt(match[0], 10),
              g: Number.parseInt(match[1], 10),
              b: Number.parseInt(match[2], 10),
            }
          : { r: 0, g: 0, b: 0 };
      }
      return { r: 0, g: 0, b: 0 }; // Default to black if can't parse
    };

    const rgb1 = parseColor(color1);
    const rgb2 = parseColor(color2);

    // Mix the colors
    const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
    const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
    const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);

    return `rgb(${r}, ${g}, ${b})`;
  }

  // Function to find logs table
  function findLogsTable() {
    console.log("Zone01 Time Tracker: Searching for logs table...");

    // Try by ID first
    const logsTableBody = document.getElementById("tbodyLogs");
    if (logsTableBody) {
      console.log("Zone01 Time Tracker: Found logs table by ID");
      return logsTableBody;
    }

    // Fallback: Find table with logTable ID
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

  // Function to find calendar table
  function findCalendarTable() {
    console.log("Zone01 Time Tracker: Searching for calendar table...");

    // Try by ID first
    const calendarTableBody = document.getElementById("tbodyWeekCalendar");
    if (calendarTableBody) {
      console.log("Zone01 Time Tracker: Found calendar table by ID");
      return calendarTableBody;
    }

    // Fallback: Look for table with week calendar class
    const calendarTable = document.querySelector(".table-week-calendar");
    if (calendarTable) {
      const tbody = calendarTable.querySelector("tbody");
      if (tbody) {
        console.log("Zone01 Time Tracker: Found calendar table by class");
        return tbody;
      }
    }

    console.log("Zone01 Time Tracker: Could not find calendar table");
    return null;
  }

  // Function to add "Remaining" column to calendar table
  function addRemainingHoursColumn() {
    try {
      const calendarTable = document.querySelector(".table-week-calendar");
      if (!calendarTable) {
        console.log("Zone01 Time Tracker: Calendar table not found for adding column");
        return;
      }

      // Check if column already exists
      if (calendarTable.querySelector('th[data-tracker-column="remaining"]')) {
        return; // Already added
      }

      // Add header cell
      const headerRow = calendarTable.querySelector("thead tr");
      if (headerRow) {
        const remainingHeader = document.createElement("th");
        remainingHeader.textContent = "Reste";
        remainingHeader.setAttribute("data-tracker-column", "remaining");
        remainingHeader.style.color = "#4ade80";
        remainingHeader.style.fontWeight = "bold";
        remainingHeader.title = "Heures restantes pour atteindre 35h (calculé par Time Tracker)";

        // Insert after "Total" column (last column)
        headerRow.appendChild(remainingHeader);

        console.log("Zone01 Time Tracker: Added 'Reste' header to calendar");
      }

      // Add body cells to all existing rows
      const bodyRows = calendarTable.querySelectorAll("tbody tr");
      for (const row of bodyRows) {
        const remainingCell = document.createElement("td");
        remainingCell.setAttribute("data-tracker-column", "remaining");
        const defaultBackgroundColor = getRemainingHoursBackgroundColor("35:00");

        // Apply styling with important flags to ensure visibility
        const defaultTextColor = getRemainingHoursTextColor("35:00");
        remainingCell.style.setProperty("color", defaultTextColor, "important");
        remainingCell.style.setProperty("font-style", "italic", "important");
        remainingCell.style.setProperty("font-weight", "bold", "important");
        remainingCell.style.setProperty("text-align", "center", "important");
        remainingCell.style.setProperty("background-color", defaultBackgroundColor, "important");
        remainingCell.style.setProperty("padding", "4px", "important");
        remainingCell.title = "Mis à jour par Zone01 Time Tracker";
        remainingCell.innerHTML = "<strong>35:00</strong>"; // Default value

        // Insert after "Total" column (last column)
        row.appendChild(remainingCell);
      }

      console.log("Zone01 Time Tracker: Added 'Reste' cells to calendar rows");
    } catch (error) {
      console.error("Zone01 Time Tracker: Error adding remaining hours column:", error);
    }
  }

  // Function to calculate remaining hours (35:00 - total hours)
  function calculateRemainingHours(totalTimeStr) {
    const totalSeconds = timeToSeconds(totalTimeStr);
    const targetSeconds = 35 * 3600; // 35 hours in seconds
    const remainingSeconds = Math.max(0, targetSeconds - totalSeconds); // Don't go negative

    return secondsToTimeShort(remainingSeconds);
  }

  // Function to get background color based on remaining hours
  function getRemainingHoursBackgroundColor(remainingTimeStr) {
    const remainingSeconds = timeToSeconds(remainingTimeStr);
    const remainingHours = remainingSeconds / 3600;

    // Color scale based on remaining hours - strong visibility
    if (remainingHours <= 0) {
      // 0 or negative hours: Green (35h goal achieved!)
      return "rgba(34, 197, 94, 0.7)"; // bg-green-500 with strong opacity
    }
    if (remainingHours <= 10) {
      // 0-10 hours: Yellow (moderate progress)
      return "rgba(250, 204, 21, 0.7)"; // bg-yellow-400 with strong opacity
    }
    if (remainingHours <= 20) {
      // 10-20 hours: Orange (needs attention)
      return "rgba(251, 146, 60, 0.7)"; // bg-orange-400 with strong opacity
    }
    // 20+ hours: Red (critical - needs lots of work)
    return "rgba(248, 113, 113, 0.7)"; // bg-red-400 with strong opacity
  }

  // Function to get text color based on remaining hours with extra dark contrast
  function getRemainingHoursTextColor(remainingTimeStr) {
    const remainingSeconds = timeToSeconds(remainingTimeStr);
    const remainingHours = remainingSeconds / 3600;

    // Extra dark thematic colors for maximum contrast
    if (remainingHours <= 0) {
      // Extra dark green text for green background (35h achieved!)
      return "#022c22"; // Even darker than green-950
    }
    if (remainingHours <= 10) {
      // Extra dark brown text for yellow background
      return "#1c0d00"; // Even darker than amber-950
    }
    if (remainingHours <= 20) {
      // Extra dark orange text for orange background
      return "#1a0600"; // Even darker than orange-950
    }
    // Extra dark red text for red background
    return "#1a0404"; // Even darker than red-950
  }

  // Function to update all calendar rows with remaining hours
  function updateAllCalendarRows() {
    try {
      const calendarTableBody = findCalendarTable();
      if (!calendarTableBody) return;

      const rows = calendarTableBody.querySelectorAll("tr");

      for (const row of rows) {
        updateWeeklyTotal(row);
      }

      console.log(`Zone01 Time Tracker: Updated remaining hours for ${rows.length} calendar rows`);
    } catch (error) {
      console.error("Zone01 Time Tracker: Error updating all calendar rows:", error);
    }
  }

  // Function to check if tables have content
  function tablesHaveContent() {
    const logsTable = findLogsTable();
    const calendarTable = findCalendarTable();

    if (!logsTable || !calendarTable) {
      return false;
    }

    const logsRows = logsTable.querySelectorAll("tr");
    const calendarRows = calendarTable.querySelectorAll("tr");

    console.log(`Zone01 Time Tracker: Found ${logsRows.length} log rows and ${calendarRows.length} calendar rows`);

    return logsRows.length > 0 && calendarRows.length > 0;
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

  // Function to find the current day cell in the calendar table
  function findCurrentDayCell() {
    const calendarTableBody = findCalendarTable();
    if (!calendarTableBody) return null;

    const today = new Date();
    const todayStr = formatDateForCalendar(today.toISOString().split("T")[0]);

    console.log(`Zone01 Time Tracker: Looking for today's cell: ${todayStr}`);

    // Search through all rows and cells
    const rows = calendarTableBody.querySelectorAll("tr");
    for (const row of rows) {
      const cells = row.querySelectorAll("td");
      // Skip the first cell (week number) and last cell (total)
      for (let i = 1; i < cells.length - 1; i++) {
        const cell = cells[i];
        const strongElement = cell.querySelector("strong");
        if (strongElement) {
          const cellDate = strongElement.textContent.trim();
          if (cellDate === todayStr) {
            console.log(`Zone01 Time Tracker: Found today's cell in column ${i}`);
            return { cell, row, columnIndex: i };
          }
        }
      }
    }

    console.log("Zone01 Time Tracker: Could not find today's cell in calendar");
    return null;
  }

  // Main function to update time displays
  function updateTimeDisplays() {
    try {
      console.log("Zone01 Time Tracker: Starting update...");

      // Find the logs table body
      const logsTableBody = findLogsTable();
      if (!logsTableBody) {
        console.log("Zone01 Time Tracker: Logs table not found");
        return;
      }

      let todayTotalSeconds = 0;
      let liveTotalSeconds = 0;
      const rows = logsTableBody.querySelectorAll("tr");

      console.log(`Zone01 Time Tracker: Processing ${rows.length} log entries`);

      // Process logs table - update live calculations and collect today's total
      rows.forEach((row, index) => {
        const cells = row.querySelectorAll("td");

        if (cells.length >= 4) {
          const date = cells[0].textContent.trim();
          const enterTime = cells[1].textContent.trim();
          const exitTime = cells[2].textContent.trim();
          const timeIn = cells[3].textContent.trim();

          console.log(`Zone01 Time Tracker: Row ${index}: Date=${date}, Enter=${enterTime}, Exit=${exitTime}, TimeIn=${timeIn}`);

          if (timeIn && timeIn !== "") {
            // Use existing time in value
            const seconds = timeToSeconds(timeIn);
            if (isToday(date)) {
              todayTotalSeconds += seconds;
            }
            console.log(`Zone01 Time Tracker: Added existing time: ${timeIn} (${seconds} seconds)`);
          } else if (enterTime && enterTime !== "" && !exitTime) {
            // Calculate live time for ongoing sessions
            if (isToday(date)) {
              const currentTime = getCurrentTime();
              const calculatedSeconds = calculateTimeDifference(enterTime, currentTime);
              const calculatedTimeStr = secondsToTimeLong(calculatedSeconds);

              // Update the Time In cell for this row
              const timeInCell = cells[3];
              timeInCell.textContent = calculatedTimeStr;
              timeInCell.style.fontStyle = "italic";
              timeInCell.style.color = "#4ade80"; // Bright green color
              timeInCell.title = "Live calculation - updates in real-time";
              timeInCell.setAttribute("data-live-calculation", "true");
              timeInCell.setAttribute("data-enter-time", enterTime);
              timeInCell.setAttribute("data-date", date);

              todayTotalSeconds += calculatedSeconds;
              liveTotalSeconds += calculatedSeconds;
              console.log(
                `Zone01 Time Tracker: Calculated and updated time for today: ${enterTime} to ${currentTime} = ${calculatedTimeStr} (${calculatedSeconds} seconds)`
              );
            }
          }
        }
      });

      // Add remaining hours column to calendar table
      addRemainingHoursColumn();

      // Update calendar table with today's total
      updateCalendarTable(todayTotalSeconds, liveTotalSeconds);

      // Show persistent indicator that the extension is working
      showPersistentIndicator();
    } catch (error) {
      console.error("Zone01 Time Tracker: Error updating time displays:", error);
    }
  }

  // Function to update calendar table
  function updateCalendarTable(todayTotalSeconds, liveTotalSeconds) {
    try {
      const currentDayData = findCurrentDayCell();
      if (!currentDayData) {
        console.log("Zone01 Time Tracker: Could not find current day cell");
        return;
      }

      const { cell, row, columnIndex } = currentDayData;

      // Get existing time from the cell (if any)
      let existingSeconds = 0;
      const cellHTML = cell.innerHTML;
      const lines = cellHTML.split("<br>");

      if (lines.length > 1) {
        const timeText = lines[1].trim();
        if (timeText !== "-") {
          // Parse existing time only if it's not already a live calculation
          if (!cell.getAttribute("data-has-live-time")) {
            const cleanTimeText = timeText.replace(/<[^>]*>/g, "").trim();
            existingSeconds = timeToSeconds(cleanTimeText);
          } else {
            // Get stored existing seconds if this is already a live calculation
            existingSeconds = Number.parseInt(cell.getAttribute("data-existing-seconds") || "0", 10);
          }
        }
      }

      // Calculate new total: existing time + live time
      const newTotalSeconds = existingSeconds + liveTotalSeconds;
      const newTimeStr = secondsToTimeShort(newTotalSeconds);

      // Update the cell content
      const strongElement = cell.querySelector("strong");
      if (strongElement) {
        const dateStr = strongElement.textContent.trim();

        if (liveTotalSeconds > 0) {
          // Show live time with green italic styling
          cell.innerHTML = `<strong>${dateStr}</strong><br><span style="color: #4ade80; font-style: italic;" title="Live calculation - includes ongoing session time">${newTimeStr}</span>`;
          cell.setAttribute("data-has-live-time", "true");
          cell.setAttribute("data-existing-seconds", existingSeconds.toString());
          cell.setAttribute("data-live-seconds", liveTotalSeconds.toString());
        } else if (existingSeconds > 0) {
          // Show only existing time
          cell.innerHTML = `<strong>${dateStr}</strong><br>${secondsToTimeShort(existingSeconds)}`;
        } else {
          // No time data
          cell.innerHTML = `<strong>${dateStr}</strong><br>-`;
        }

        console.log(`Zone01 Time Tracker: Updated today's cell with ${newTimeStr} (${existingSeconds}s existing + ${liveTotalSeconds}s live)`);
      }

      // Update all weekly totals
      updateAllCalendarRows();
    } catch (error) {
      console.error("Zone01 Time Tracker: Error updating calendar table:", error);
    }
  }

  // Function to update weekly total in the calendar
  function updateWeeklyTotal(weekRow) {
    try {
      const cells = weekRow.querySelectorAll("td");

      // Find total cell (second to last cell now that we have remaining column)
      let totalCell = null;
      let remainingCell = null;

      // Look for cells by data attribute to be more reliable
      for (const cell of cells) {
        if (cell.getAttribute("data-tracker-column") === "remaining") {
          remainingCell = cell;
          // Total cell should be the one before remaining
          const cellIndex = Array.from(cells).indexOf(cell);
          if (cellIndex > 0) {
            totalCell = cells[cellIndex - 1];
          }
          break;
        }
      }

      // Fallback: if no remaining column found yet, total is last cell
      if (!totalCell) {
        totalCell = cells[cells.length - 1];
      }

      if (!totalCell) return;

      let weekTotalSeconds = 0;

      // Sum up all days in the week (skip first cell which is week number, and skip total/remaining cells)
      const endIndex = remainingCell ? cells.length - 2 : cells.length - 1;
      for (let i = 1; i < endIndex; i++) {
        const dayCell = cells[i];
        const cellHTML = dayCell.innerHTML;
        const lines = cellHTML.split("<br>");

        if (lines.length > 1) {
          const timeText = lines[1].trim();
          if (timeText !== "-") {
            // Clean up the time text and parse it
            const cleanTimeText = timeText.replace(/<[^>]*>/g, "").trim();
            const daySeconds = timeToSeconds(cleanTimeText);
            weekTotalSeconds += daySeconds;
          }
        }
      }

      // Get original total to preserve styling
      const originalContent = totalCell.innerHTML;
      let originalSeconds = 0;

      // Try to extract original time from the total cell
      if (!totalCell.getAttribute("data-original-total")) {
        const strongElement = totalCell.querySelector("strong");
        if (strongElement) {
          const originalTimeStr = strongElement.textContent.trim();
          originalSeconds = timeToSeconds(originalTimeStr);
          totalCell.setAttribute("data-original-total", originalTimeStr);
        }
      } else {
        originalSeconds = timeToSeconds(totalCell.getAttribute("data-original-total"));
      }

      // Update total with live calculation
      const newTotalStr = secondsToTimeShort(weekTotalSeconds);

      // Update with italic styling to indicate live updates (keeping original color)
      totalCell.innerHTML = `<strong style="font-style: italic;" title="Updated by Zone01 Time Tracker - includes live calculations">${newTotalStr}</strong>`;

      // Update remaining hours column if it exists
      if (remainingCell) {
        const remainingTimeStr = calculateRemainingHours(newTotalStr);
        const backgroundColor = getRemainingHoursBackgroundColor(remainingTimeStr);

        // Apply styling with important flags to override site CSS
        const textColor = getRemainingHoursTextColor(remainingTimeStr);

        remainingCell.style.setProperty("background-color", backgroundColor, "important");
        remainingCell.style.setProperty("color", textColor, "important");
        remainingCell.style.setProperty("font-style", "italic", "important");
        remainingCell.style.setProperty("font-weight", "bold", "important");
        remainingCell.style.setProperty("padding", "4px", "important");

        remainingCell.innerHTML = `<strong title="Heures restantes pour atteindre 35h">${remainingTimeStr}</strong>`;
        console.log(`Zone01 Time Tracker: Updated remaining hours to ${remainingTimeStr} with background ${backgroundColor}`);
        console.log("Zone01 Time Tracker: Cell computed background:", window.getComputedStyle(remainingCell).backgroundColor);
      }

      console.log(`Zone01 Time Tracker: Updated weekly total to ${newTotalStr} (${weekTotalSeconds} seconds)`);
    } catch (error) {
      console.error("Zone01 Time Tracker: Error updating weekly total:", error);
    }
  }

  // Function to update only the live time calculations (more frequent updates)
  function updateLiveCalculations() {
    try {
      const liveCells = document.querySelectorAll('[data-live-calculation="true"]');

      if (liveCells.length === 0) {
        return; // No live calculations to update
      }

      console.log(`Zone01 Time Tracker: Updating ${liveCells.length} live calculations`);

      let totalLiveSeconds = 0;

      for (const cell of liveCells) {
        const enterTime = cell.getAttribute("data-enter-time");
        const date = cell.getAttribute("data-date");

        if (enterTime && date && isToday(date)) {
          const currentTime = getCurrentTime();
          const calculatedSeconds = calculateTimeDifference(enterTime, currentTime);
          const calculatedTimeStr = secondsToTimeLong(calculatedSeconds);

          // Update the cell if the value has changed
          if (cell.textContent !== calculatedTimeStr) {
            cell.textContent = calculatedTimeStr;
          }

          totalLiveSeconds += calculatedSeconds;
        }
      }

      // Update calendar with new live calculations
      updateCalendarLiveTime(totalLiveSeconds);
    } catch (error) {
      console.error("Zone01 Time Tracker: Error updating live calculations:", error);
    }
  }

  // Function to update only the live portion of calendar calculations
  function updateCalendarLiveTime(liveTotalSeconds) {
    try {
      const currentDayData = findCurrentDayCell();
      if (!currentDayData) return;

      const { cell, row } = currentDayData;

      if (cell.getAttribute("data-has-live-time") === "true") {
        const existingSeconds = Number.parseInt(cell.getAttribute("data-existing-seconds") || "0", 10);
        const newTotalSeconds = existingSeconds + liveTotalSeconds;
        const newTimeStr = secondsToTimeShort(newTotalSeconds);

        // Update the cell
        const strongElement = cell.querySelector("strong");
        if (strongElement) {
          const dateStr = strongElement.textContent.trim();
          cell.innerHTML = `<strong>${dateStr}</strong><br><span style="color: #4ade80; font-style: italic;" title="Live calculation - includes ongoing session time">${newTimeStr}</span>`;
          cell.setAttribute("data-live-seconds", liveTotalSeconds.toString());
        }

        // Update all weekly totals (not just this row)
        updateAllCalendarRows();
      }
    } catch (error) {
      console.error("Zone01 Time Tracker: Error updating calendar live time:", error);
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
            updateTimeDisplays();
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

    indicator.textContent = "✓ Time Tracker Extension Active";
    indicator.title = "Zone01 Time Tracker is calculating and updating your hours in real-time";

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
    text.textContent = "Live updating";
    frequencyIndicator.appendChild(text);

    indicatorWrapper.appendChild(indicator);
    indicatorWrapper.appendChild(frequencyIndicator);
    parent.appendChild(indicatorWrapper);
    console.log("Zone01 Time Tracker: Persistent indicator created");
  }

  // Function to set up Enter and Exit button click listeners
  function setupButtonListeners() {
    const enterButton = document.getElementById("student_enter");
    const exitButton = document.getElementById("student_exit");

    if (enterButton) {
      enterButton.addEventListener("click", () => {
        console.log("Zone01 Time Tracker: Enter button clicked, scheduling update...");
        // Add delay to allow the site to update itself first
        setTimeout(() => {
          console.log("Zone01 Time Tracker: Updating after Enter button click");
          updateTimeDisplays();
        }, 2000); // 2 second delay to ensure site has time to update
      });
      console.log("Zone01 Time Tracker: Enter button listener set up");
    } else {
      console.log("Zone01 Time Tracker: Enter button not found");
    }

    if (exitButton) {
      exitButton.addEventListener("click", () => {
        console.log("Zone01 Time Tracker: Exit button clicked, scheduling update...");
        // Add delay to allow the site to update itself first
        setTimeout(() => {
          console.log("Zone01 Time Tracker: Updating after Exit button click");
          updateTimeDisplays();
        }, 2000); // 2 second delay to ensure site has time to update
      });
      console.log("Zone01 Time Tracker: Exit button listener set up");
    } else {
      console.log("Zone01 Time Tracker: Exit button not found");
    }
  }

  // Wait for page to be fully loaded and run the update
  function init() {
    console.log("Zone01 Time Tracker: Initializing...");

    // Set up mutation observer to watch for dynamic content
    setupMutationObserver();

    function startWaiting() {
      console.log("Zone01 Time Tracker: Starting to wait for tables...");
      waitForTables(() => {
        updateTimeDisplays();
        // Set up Enter and Exit button click listeners after tables are found
        setupButtonListeners();
        // Set up regular full updates every 60 seconds
        setInterval(updateTimeDisplays, 60000);
        // Set up frequent live calculation updates every second
        setInterval(updateLiveCalculations, 1000);
        console.log("Zone01 Time Tracker: Set up live calculation updates every second");
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
})();
