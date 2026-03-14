/**
 * Handles search input and filters task cards
 */
function onSearchInput() {
  const searchValue = getSearchValue();
  const taskCards = document.querySelectorAll(".task-card");
  const errorMessage = document.getElementById("search_error");

  if (searchValue === "") {
    showAllCards(taskCards);
    hideErrorMessage(errorMessage);
    return;
  }

  const visibleCount = filterTaskCards(taskCards, searchValue);
  toggleErrorMessage(errorMessage, visibleCount);
}


/**
 * Gets the search value from input field
 * @returns {string} Trimmed lowercase search value
 */
function getSearchValue() {
  const inputField = document.getElementById("searchInput");
  return inputField.value.toLowerCase().trim();
}


/**
 * Shows all task cards
 * @param {NodeList} taskCards - Collection of task card elements
 */
function showAllCards(taskCards) {
  taskCards.forEach(function (card) {
    card.style.display = "block";
  });
}


/**
 * Hides the search error message
 * @param {HTMLElement} errorMessage - Error message element
 */
function hideErrorMessage(errorMessage) {
  errorMessage.style.display = "none";
}


/**
 * Filters task cards based on search value
 * @param {NodeList} taskCards - Collection of task card elements
 * @param {string} searchValue - Search query
 * @returns {number} Number of visible cards after filtering
 */
function filterTaskCards(taskCards, searchValue) {
  let visibleCardCount = 0;
  taskCards.forEach(function (card) {
    if (cardMatchesSearch(card, searchValue)) {
      card.style.display = "block";
      visibleCardCount++;
    } else {
      card.style.display = "none";
    }
  });
  return visibleCardCount;
}


/**
 * Checks if card matches search criteria
 * @param {HTMLElement} card - Task card element
 * @param {string} searchValue - Search query
 * @returns {boolean} True if card matches search
 */
function cardMatchesSearch(card, searchValue) {
  const titleText = getCardTitleText(card);
  const descriptionText = getCardDescriptionText(card);
  return titleText.includes(searchValue) || descriptionText.includes(searchValue);
}


/**
 * Extracts title text from card
 * @param {HTMLElement} card - Task card element
 * @returns {string} Lowercase title text
 */
function getCardTitleText(card) {
  const titleElement = card.querySelector(".task-title");
  return titleElement ? titleElement.textContent.toLowerCase() : "";
}


/**
 * Extracts description text from card
 * @param {HTMLElement} card - Task card element
 * @returns {string} Lowercase description text
 */
function getCardDescriptionText(card) {
  const descriptionElement = card.querySelector(".task-description");
  return descriptionElement ? descriptionElement.textContent.toLowerCase() : "";
}


/**
 * Shows or hides error message based on visible count
 * @param {HTMLElement} errorMessage - Error message element
 * @param {number} visibleCount - Number of visible cards
 */
function toggleErrorMessage(errorMessage, visibleCount) {
  errorMessage.style.display = visibleCount === 0 ? "block" : "none";
}


/**
 * Sets focus to the search input field
 */
function focusSearchInputField() {
  const inputField = document.getElementById("searchInput");
  inputField.focus();
}
