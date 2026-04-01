let contacts = [];
let globalClickHandlerRegistered = false;

/**
 * Loads all contacts and refreshes the assignee user interface.
 */
async function loadContacts() {
  const mergedContactsObject = await readMergedContacts();
  const normalizedContacts = await buildSortedContacts(mergedContactsObject);
  contacts = normalizedContacts;
  renderAssigneeOptions();
  updateAssigneeDisplay();
}

/**
 * Reads and merges all available contact sources.
 * @returns {Promise<Object>} Contact map.
 */
async function readMergedContacts() {
  const sourcePaths = isGuestSessionUser() ? ["guest-contacts/", "contacts/"] : ["contacts/"];
  const mergedContactsObject = await loadMergedContactsFromPaths(sourcePaths);
  if (!isGuestSessionUser()) await includeLoggedInUserInAddTaskContacts(mergedContactsObject);
  return mergedContactsObject;
}

/**
 * Builds the sorted contact list.
 * @param {Object} mergedContactsObject - Raw contacts.
 * @returns {Promise<Array>} Sorted contacts.
 */
async function buildSortedContacts(mergedContactsObject) {
  let normalizedContacts = Object.values(mergedContactsObject).map(mapContact).filter(hasContactName);
  normalizedContacts = deduplicateContacts(normalizedContacts);
  if (shouldUseGuestFallback(normalizedContacts)) normalizedContacts = getGuestContactsFallback().map(mapContact);
  return sortContactsByName(normalizedContacts);
}

/**
 * Loads multiple contact paths into one map.
 * @param {string[]} sourcePaths - Storage paths.
 * @returns {Promise<Object>} Contact map.
 */
async function loadMergedContactsFromPaths(sourcePaths) {
  const mergedContactsObject = {};
  for (const sourcePath of sourcePaths) {
    const rawContacts = (await loadData(sourcePath)) || {};
    const normalizedObject = normalizeRawContactsToObject(rawContacts, sourcePath);
    mergeContactsIntoTarget(mergedContactsObject, normalizedObject);
  }
  return mergedContactsObject;
}

/**
 * Normalizes raw contacts into an object.
 * @param {*} rawContacts - Raw storage data.
 * @param {string} sourcePath - Prefix for array keys.
 * @returns {Object} Normalized map.
 */
function normalizeRawContactsToObject(rawContacts, sourcePath = "") {
  if (Array.isArray(rawContacts)) return createContactMapFromArray(rawContacts, sourcePath);
  if (rawContacts && typeof rawContacts === "object") return { ...rawContacts };
  return {};
}

/**
 * Converts an array into a keyed contact map.
 * @param {Array} rawContacts - Contact array.
 * @param {string} sourcePath - Key prefix.
 * @returns {Object} Contact map.
 */
function createContactMapFromArray(rawContacts, sourcePath) {
  return Object.fromEntries(rawContacts.map((contactObject, index) => [`${sourcePath}${index}`, contactObject]));
}

/**
 * Copies contacts into the target map.
 * @param {Object} targetObject - Target map.
 * @param {Object} sourceObject - Source map.
 */
function mergeContactsIntoTarget(targetObject, sourceObject) {
  Object.entries(sourceObject).forEach(([contactId, contactObject]) => {
    targetObject[contactId] = contactObject;
  });
}

/**
 * Adds the logged-in user to the contacts list.
 * @param {Object} contactsObject - Target contact map.
 */
async function includeLoggedInUserInAddTaskContacts(contactsObject) {
  const userId = sessionStorage.getItem("userId");
  if (!shouldIncludeLoggedInUser(userId, contactsObject)) return;
  const userObject = await loadData(`users/${userId}`);
  if (!userObject) return;
  contactsObject[userId] = buildContactFromUser(userObject);
}

/**
 * Checks whether the logged-in user should be added.
 * @param {string|null} userId - Session identifier.
 * @param {Object} contactsObject - Contact map.
 * @returns {boolean} True when missing.
 */
function shouldIncludeLoggedInUser(userId, contactsObject) {
  return Boolean(userId) && userId !== "guest" && !contactsObject[userId];
}

/**
 * Builds a contact object from a user object.
 * @param {Object} userObject - User data.
 * @returns {Object} Contact data.
 */
function buildContactFromUser(userObject) {
  return {
    contactName: String(userObject.username || userObject.name || "").trim(),
    contactMail: String(userObject.mail || "").trim(),
    contactPhone: String(userObject.phone || "").trim(),
    color: userObject.color || "#CCCCCC",
  };
}

/**
 * Returns fallback contacts for guest sessions.
 * @returns {Array} Contact array.
 */
function getGuestContactsFallback() {
  if (Array.isArray(window.GUEST_CONTACTS_FALLBACK)) return window.GUEST_CONTACTS_FALLBACK;
  if (window.guestContacts && typeof window.guestContacts === "object") return Object.values(window.guestContacts);
  return createDefaultGuestContacts();
}

/**
 * Returns default guest contacts.
 * @returns {Array} Contact array.
 */
function createDefaultGuestContacts() {
  return [
    { name: "Sofia Müller", color: "#ff7a00" },
    { name: "Max Mustermann", color: "#9327ff" },
    { name: "Anna Schmidt", color: "#6e52ff" },
  ];
}

/**
 * Maps raw contact data to the assignee format.
 * @param {Object} contactObject - Raw contact.
 * @returns {Object} Normalized contact.
 */
function mapContact(contactObject = {}) {
  return {
    name: readContactName(contactObject),
    mail: String(contactObject.contactMail || contactObject.mail || "").trim(),
    phone: String(contactObject.contactPhone || contactObject.phone || "").trim(),
    color: contactObject.color || "#CCCCCC",
  };
}

/**
 * Reads the best available contact name.
 * @param {Object} contactObject - Raw contact.
 * @returns {string} Contact name.
 */
function readContactName(contactObject) {
  return String(contactObject.contactName || contactObject.name || contactObject.contactMail || "").trim();
}

/**
 * Checks whether a contact has a visible name.
 * @param {Object} contactObject - Normalized contact.
 * @returns {boolean} True when named.
 */
function hasContactName(contactObject) {
  return contactObject.name.length > 0;
}

/**
 * Removes duplicate contacts by name and mail.
 * @param {Array} contactList - Contact array.
 * @returns {Array} Unique contacts.
 */
function deduplicateContacts(contactList) {
  const seenKeys = new Set();
  return contactList.filter((contactObject) => keepUniqueContact(contactObject, seenKeys));
}

/**
 * Keeps a contact only once.
 * @param {Object} contactObject - Contact item.
 * @param {Set} seenKeys - Seen keys.
 * @returns {boolean} True when unique.
 */
function keepUniqueContact(contactObject, seenKeys) {
  const uniqueKey = buildContactKey(contactObject);
  if (seenKeys.has(uniqueKey)) return false;
  seenKeys.add(uniqueKey);
  return true;
}

/**
 * Builds a unique contact key.
 * @param {Object} contactObject - Contact item.
 * @returns {string} Unique key.
 */
function buildContactKey(contactObject) {
  const normalizedName = String(contactObject.name || "").trim().toLowerCase();
  const normalizedMail = String(contactObject.mail || "").trim().toLowerCase();
  return `${normalizedName}|${normalizedMail}`;
}

/**
 * Checks whether guest fallback contacts are needed.
 * @param {Array} contactList - Contact array.
 * @returns {boolean} True when fallback is needed.
 */
function shouldUseGuestFallback(contactList) {
  return isGuestSessionUser() && contactList.length === 0;
}

/**
 * Sorts contacts by name.
 * @param {Array} contactList - Contact array.
 * @returns {Array} Sorted contacts.
 */
function sortContactsByName(contactList) {
  return contactList.sort((firstContact, secondContact) => firstContact.name.localeCompare(secondContact.name, "de"));
}

/**
 * Registers shared dropdown events.
 */
function registerDropdownEvents() {
  bindClick("assignee-header", toggleAssigneeDropdown);
  bindClick("category-header", toggleCategoryDropdown);
}

/**
 * Registers category option events.
 */
function registerCategoryOptionEvents() {
  document.querySelectorAll("#category-dropdown .category-option").forEach(registerCategoryOptionEvent);
}

/**
 * Registers one category option event.
 * @param {HTMLElement} optionElement - Category option.
 */
function registerCategoryOptionEvent(optionElement) {
  optionElement.addEventListener("click", () => selectCategory(optionElement.dataset.category));
}

/**
 * Toggles the assignee dropdown.
 */
function toggleAssigneeDropdown() {
  toggleDropdownById("assignee-dropdown");
  closeDropdownById("category-dropdown");
}

/**
 * Toggles the category dropdown.
 */
function toggleCategoryDropdown() {
  toggleDropdownById("category-dropdown");
  closeDropdownById("assignee-dropdown");
}

/**
 * Toggles a dropdown by identifier.
 * @param {string} dropdownId - Element identifier.
 */
function toggleDropdownById(dropdownId) {
  getElement(dropdownId)?.classList.toggle("d-none");
}

/**
 * Closes a dropdown by identifier.
 * @param {string} dropdownId - Element identifier.
 */
function closeDropdownById(dropdownId) {
  getElement(dropdownId)?.classList.add("d-none");
}

/**
 * Selects a task category.
 * @param {string} categoryValue - Category value.
 */
function selectCategory(categoryValue) {
  setCategoryHiddenInput(categoryValue);
  setCategoryPlaceholderText(categoryValue);
  closeDropdownById("category-dropdown");
  removeCategoryError();
}

/**
 * Sets the hidden category input.
 * @param {string} categoryValue - Category value.
 */
function setCategoryHiddenInput(categoryValue) {
  const hiddenInputElement = getElement("category");
  if (!hiddenInputElement) return;
  hiddenInputElement.value = categoryValue || "";
  hiddenInputElement.dispatchEvent(new Event("change", { bubbles: true }));
}

/**
 * Updates the category placeholder label.
 * @param {string} categoryValue - Category value.
 */
function setCategoryPlaceholderText(categoryValue) {
  const placeholderElement = getElement("selected-category-placeholder");
  if (!placeholderElement) return;
  placeholderElement.textContent = getCategoryPlaceholderText(categoryValue);
}

/**
 * Returns the visible category label.
 * @param {string} categoryValue - Category value.
 * @returns {string} Visible label.
 */
function getCategoryPlaceholderText(categoryValue) {
  if (categoryValue === "technical-task") return "Technical Task";
  if (categoryValue === "user-story") return "User Story";
  return "Select category";
}

/**
 * Removes the category error state.
 */
function removeCategoryError() {
  clearFieldError("category", "error-category");
}

/**
 * Closes task dropdowns.
 */
function closeTaskDropdowns() {
  closeDropdownById("assignee-dropdown");
  closeDropdownById("category-dropdown");
}

/**
 * Registers one click listener.
 * @param {string} elementId - Element identifier.
 * @param {Function} callbackFunction - Click callback.
 */
function bindClick(elementId, callbackFunction) {
  const targetElement = getElement(elementId);
  if (!targetElement) return;
  targetElement.addEventListener("click", callbackFunction);
}

/**
 * Registers the global outside click handler once.
 */
function registerGlobalClickHandler() {
  if (globalClickHandlerRegistered) return;
  document.addEventListener("click", handleOutsideClick);
  globalClickHandlerRegistered = true;
}

/**
 * Closes open dropdowns after outside clicks.
 * @param {MouseEvent} mouseEvent - Click event.
 */
function handleOutsideClick(mouseEvent) {
  closeDropdownIfClickedOutside("assignee-dropdown", ".custom-multiselect", mouseEvent);
  closeDropdownIfClickedOutside("category-dropdown", ".custom-category-select", mouseEvent);
}

/**
 * Closes a dropdown after an outside click.
 * @param {string} dropdownId - Dropdown identifier.
 * @param {string} containerSelector - Parent selector.
 * @param {MouseEvent} mouseEvent - Click event.
 */
function closeDropdownIfClickedOutside(dropdownId, containerSelector, mouseEvent) {
  const dropdownElement = getElement(dropdownId);
  const containerElement = document.querySelector(containerSelector);
  if (!dropdownElement || !containerElement) return;
  if (!containerElement.contains(mouseEvent.target)) dropdownElement.classList.add("d-none");
}