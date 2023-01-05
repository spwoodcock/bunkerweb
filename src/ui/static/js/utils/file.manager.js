class FolderNav {
  constructor(prefix) {
    this.prefix = prefix;
    this.breadContainer = document.querySelector(`[${this.prefix}-breadcrumb]`);
    this.container = document.querySelector(`[${this.prefix}-container]`);
    this.listContainer = document.querySelector(`[${this.prefix}-folders]`);
    this.els = document.querySelectorAll(`div[${this.prefix}-element]`);
    this.files = document.querySelectorAll(
      `div[${this.prefix}-element][_type='file']`
    );
    this.addFileEl = document.querySelector(`[${this.prefix}-add-file]`);
    this.addFolderEl = document.querySelector(`[${this.prefix}-add-folder]`);
    this.initSorted();
    this.initNav();
  }

  //sorted elements to get folders first
  initSorted() {
    this.files.forEach((file) => {
      this.listContainer.append(file);
    });
  }

  initNav() {
    this.container.addEventListener("click", (e) => {
      //GO ON NESTED FOLDER
      try {
        if (e.target.closest("div").getAttribute("_type") === "folder") {
          //avoid logic on action btn click
          const folder = e.target.closest("div[_type='folder']");
          this.updatedNested(folder);
        }
      } catch (err) {}
      //BREACRUMB ITEM
      try {
        if (
          e.target
            .closest("li")
            .hasAttribute(`${this.prefix}-breadcrumb-item`) &&
          !e.target.closest("li").hasAttribute(`${this.prefix}-back`) &&
          e.target.closest("li").nextSibling !== null
        ) {
          const breadItem = e.target.closest("li");
          this.updateBread(breadItem);
        }
      } catch (err) {}
      //BREADCRUMB BACK LOGIC
      try {
        if (
          e.target.closest("li").hasAttribute(`${this.prefix}-back`) &&
          +this.breadContainer.lastElementChild.getAttribute("level") !== 0
        ) {
          //back is like clicking on last prev element
          const prevItem =
            this.breadContainer.lastElementChild.previousElementSibling;
          this.updateBread(prevItem);
        }
      } catch (err) {}
    });
  }

  //go to nested folder element
  updatedNested(folder) {
    const [folderPath, folderLvl, folderTxt] = this.getElAtt(folder);
    //hidden all
    this.hiddenConfEls();
    //show every files in folder
    this.showCurrentFolderEls(folderPath, +folderLvl);
    //update breadcrumb
    this.appendBreadItem(folderPath, folderLvl, folderTxt);
    //update actions
    this.updateActions(folder);
  }

  //update clicked bread and check for allow add conf
  updateBread(item) {
    const [prevPath, prevLvl, prevTxt] = this.getElAtt(item);
    this.hiddenConfEls();
    //show every files in folder
    this.showCurrentFolderEls(prevPath, +prevLvl);
    //remove useless bread
    this.removeBreadElByLvl(+prevLvl);
    const folder = document.querySelector(
      `div[${this.prefix}-element][path='${item.getAttribute("path")}']`
    );
    this.updateActions(folder);
  }

  //check if file/folder can be created on folder
  updateActions(folder) {
    //by default
    this.hideAddConf();
    //check if folder allow add file/folder
    const isAddFile = folder.getAttribute("can-create-file");
    const isAddFolder = folder.getAttribute("can-create-folder");
    isAddFile === "True" ? this.addFileEl.classList.remove("hidden") : "";
    isAddFolder === "True" ? this.addFolderEl.classList.remove("hidden") : "";
  }

  hideAddConf() {
    this.addFileEl.classList.add("hidden");
    this.addFolderEl.classList.add("hidden");
  }

  showCurrentFolderEls(path, lvl) {
    const nestedEl = document.querySelectorAll(
      `div[path^="${path}/"][level="${+lvl + 1}"]`
    );
    for (let i = 0; i < nestedEl.length; i++) {
      const el = nestedEl[i];
      el.setAttribute("current-el", "");
      el.classList.remove("hidden");
    }
  }

  //remove the bread items with a higher level than
  //the clicked bread item
  removeBreadElByLvl(lvl) {
    const breadcrumbItem = this.breadContainer.querySelectorAll(
      `[${this.prefix}-breadcrumb-item]`
    );
    breadcrumbItem.forEach((item) => {
      if (item.hasAttribute("level") && +item.getAttribute("level") > lvl)
        item.remove();
    });
  }

  //retrieve path, level and text
  getElAtt(el) {
    const newPath = el.getAttribute("path");
    const newLvl = el.getAttribute("level");
    const newTxt = el.getAttribute("name");
    return [newPath, newLvl, newTxt];
  }

  //hidden all folders
  hiddenConfEls() {
    this.els.forEach((el) => {
      el.classList.add("hidden");
      el.removeAttribute("current-el");
    });
  }

  //add a bread item as last child with needed info
  appendBreadItem(path, level, name) {
    //create item el
    const itemEl = document.createElement("li");
    itemEl.className = "leading-normal text-sm";
    //set item atts
    const itemAtt = [
      ["path", path],
      [`${this.prefix}-breadcrumb-item`, ""],
      ["level", level],
      ["name", name],
    ];
    for (let i = 0; i < itemAtt.length; i++) {
      itemEl.setAttribute(`${itemAtt[i][0]}`, `${itemAtt[i][1]}`);
    }
    //create nested btn el
    const nestedBtnEl = document.createElement("button");
    nestedBtnEl.className =
      "ml-2 dark:text-white dark:opacity-50 text-gray-700 opacity-50 after:float-right after:pl-2 after:text-gray-600 after:content-['/']";
    itemEl.appendChild(nestedBtnEl);
    nestedBtnEl.setAttribute("type", "button");
    nestedBtnEl.textContent = name;
    this.breadContainer.appendChild(itemEl);
  }
}

class FolderDropdown {
  constructor(prefix) {
    this.prefix = prefix;
    this.container = document.querySelector(`[${this.prefix}-container]`);
    this.dropEls = document.querySelectorAll(
      `[${this.prefix}-action-dropdown]`
    );
    this.init();
  }

  init() {
    let prevActionBtn = ""; //compare with curr to hide or not prev
    this.container.addEventListener("click", (e) => {
      //show dropdown actions for folders
      try {
        if (
          e.target.closest("div").hasAttribute(`${this.prefix}-action-button`)
        ) {
          const att = e.target
            .closest("div")
            .getAttribute(`${this.prefix}-action-button`);
          const dropEl = document.querySelector(
            `[${this.prefix}-action-dropdown="${att}"]`
          );
          //avoid multiple dropdown
          if (prevActionBtn === "") prevActionBtn = dropEl;
          if (prevActionBtn !== dropEl) this.hideDropEls();
          this.toggleDrop(dropEl);
          prevActionBtn = dropEl;
        }
      } catch (err) {}
      //hide dropdown clicking an action
      try {
        if (
          e.target
            .closest("button")
            .hasAttribute(`${this.prefix}-action-dropdown-btn`)
        ) {
          const att = e.target
            .closest("button")
            .getAttribute(`${this.prefix}-action-dropdown-btn`);
          const dropEl = document.querySelector(
            `[${this.prefix}-action-dropdown="${att}"]`
          );
          this.hideDrop(dropEl);
        }
      } catch (err) {}
    });
  }

  //UTILS

  toggleDrop(dropEl) {
    dropEl.classList.toggle("hidden");
    dropEl.classList.toggle("flex");
  }

  hideDrop(dropEl) {
    dropEl.classList.add("hidden");
    dropEl.classList.remove("flex");
  }

  hideDropEls() {
    this.dropEls.forEach((drop) => {
      this.hideDrop(drop);
    });
  }
}

class FolderEditor {
  constructor() {
    this.editor = ace.edit("editor");
    this.darkMode = document.querySelector("[dark-toggle]");
    this.initEditor();
    this.listenDarkToggle();
  }

  initEditor() {
    //editor options
    this.editor.setShowPrintMargin(false);
    this.setDarkMode();
  }

  //listen to dark toggle button to change theme
  listenDarkToggle() {
    this.darkMode.addEventListener("click", (e) => {
      this.darkMode.checked
        ? this.changeDarkMode(true)
        : this.changeDarkMode(false);
    });
  }

  setDarkMode() {
    document.querySelector("html").className.includes("dark")
      ? this.editor.setTheme("ace/theme/twilight")
      : this.editor.setTheme("ace/theme/cloud9_day");
  }

  //change theme according to mode
  changeDarkMode(bool) {
    bool
      ? this.editor.setTheme("ace/theme/twilight")
      : this.editor.setTheme("ace/theme/cloud9_day");
  }

  readOnlyBool(bool) {
    this.editor.setReadOnly(bool);
  }
}

class FolderModal {
  constructor(prefix) {
    this.prefix = prefix;
    //container
    this.container = document.querySelector(`[${this.prefix}-container]`);
    //add service/file elements
    this.breadContainer = document.querySelector(`[${this.prefix}-breadcrumb]`);
    this.addConfContainer = document.querySelector(
      `[${this.prefix}-add-container]`
    );
    //modal DOM elements
    this.form = document.querySelector(`[${this.prefix}-modal-form]`);
    this.modalEl = document.querySelector(`[${this.prefix}-modal]`);
    this.modalTitle = this.modalEl.querySelector(
      `[${this.prefix}-modal-title]`
    );
    this.modalPath = this.modalEl.querySelector(`[${this.prefix}-modal-path]`);
    this.modalEditor = this.modalEl.querySelector(
      `[${this.prefix}-modal-editor]`
    );
    this.modalPathPrev = this.modalPath.querySelector(
      `p[${this.prefix}-modal-path-prefix]`
    );
    this.modalPathName = this.modalPath.querySelector("input");
    this.modalPathSuffix = this.modalPath.querySelector(
      `p[${this.prefix}-modal-path-suffix]`
    );

    this.modalSubmit = this.modalEl.querySelector(
      `[${this.prefix}-modal-submit]`
    );
    //hidden input for backend
    this.modalInpPath = this.modalEl.querySelector("#path");
    this.modalInpOperation = this.modalEl.querySelector("#operation");
    this.modalInpType = this.modalEl.querySelector("#_type");
    this.modalInpOldName = this.modalEl.querySelector("#old_name");
    this.modalTxtarea = this.modalEl.querySelector("#content");
    //HANDLERS
    //modal and values logic after clicking add file/folder button
    this.initAddConfig();
    //modal and values logic after clicking actions buttons
    this.initActionToModal();
    //modal element logic
    this.initModal();
    //modal submit check and filter before submit
    this.initForm();
  }

  //HANDLERS
  initAddConfig() {
    this.addConfContainer.addEventListener("click", (e) => {
      //add folder
      try {
        if (e.target.closest("li").hasAttribute(`${this.prefix}-add-folder`)) {
          this.setModal(
            "new",
            this.getPathFromBread(),
            "folder",
            "",
            "",
            this.getLevelFromBread()
          );
        }
      } catch (err) {}
      //add file
      try {
        if (e.target.closest("li").hasAttribute(`${this.prefix}-add-file`)) {
          this.setModal(
            "new",
            this.getPathFromBread(),
            "file",
            "",
            "",
            this.getLevelFromBread()
          );
        }
      } catch (err) {}
    });
  }

  initActionToModal() {
    this.container.addEventListener("click", (e) => {
      //click on file logic
      try {
        if (e.target.closest("div").getAttribute("_type") == "file") {
          const btnEl = e.target
            .closest("div")
            .querySelector('button[value="view"]');
          const [action, path, type, content, name, level] =
            this.getInfoFromActionBtn(btnEl);
          this.setModal(action, path, type, content, name, level);
          this.showModal();
        }
      } catch (err) {}
      //set data of folder and show modal unless it's download btn
      try {
        if (
          e.target
            .closest("button")
            .hasAttribute(`${this.prefix}-action-dropdown-btn`) &&
          e.target.closest("button").getAttribute("value") !== "download"
        ) {
          const btnEl = e.target.closest("button");
          const [action, path, type, content, name, level] =
            this.getInfoFromActionBtn(btnEl);
          this.setModal(action, path, type, content, name, level);
          this.showModal();
        }
      } catch (err) {}
      //download btn logic
      try {
        if (
          e.target
            .closest("button")
            .hasAttribute(`${this.prefix}-action-dropdown-btn`) &&
          e.target.closest("button").getAttribute("value") === "download"
        ) {
          const btnEl = e.target.closest("button");
          const [action, path, type, content, name, level] =
            this.getInfoFromActionBtn(btnEl);
          this.download(name, content);
        }
      } catch (err) {}
    });
  }

  initModal() {
    this.modalEl.addEventListener("click", (e) => {
      //close modal logic
      try {
        if (
          e.target.closest("button").hasAttribute(`${this.prefix}-modal-close`)
        ) {
          this.closeModal();
        }
      } catch (err) {}
    });
  }

  download(filename, text) {
    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  initForm() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      //submit nothing case
      if (this.modalInpOperation.value === "view") {
        return this.closeModal();
      }
      //else set data to input and request
      this.setDataForRequest();
    });
  }

  //get data of custom inputs and set it on submit input
  setDataForRequest() {
    //set path to input
    if (this.modalInpType === "folder") {
      const prevPath = this.modalPathPrev.textContent;
      const name = this.modalPathName.value;
      this.modalInpPath.value = `${prevPath}${name}`;
    }
    //set textarea value from editor
    const newTextarea = ace.edit("editor").getValue();
    this.modalTxtarea.value = newTextarea;
    this.form.submit();
  }

  //for add file/folder btn
  //get path of last bread element
  getPathFromBread() {
    const path = this.breadContainer.lastElementChild.getAttribute("path");
    return `${path}/`;
  }

  getLevelFromBread() {
    const level = this.breadContainer.lastElementChild.getAttribute("level");
    return level;
  }
  //set all needed data from btn action and folder info
  setModal(action, path, type, content, name, level) {
    //title
    this.modalTitle.textContent = `${action} ${type}`;
    this.setInpt(action, path, type, name);
    this.setEditor(type, content);
    this.setSubmitTxt(action);
    this.setPath(action, path, type, name, level);
    this.setDisabled(action);
    this.showModal();
  }

  //for hidden input to send on backend
  //on form submit, check for update values before send request
  setInpt(action, path, type, name) {
    this.modalInpPath.value =
      type === "file" && this.prefix === "configs"
        ? path.replace(".conf", "")
        : path;
    this.modalInpType.value = type;
    this.modalInpOperation.value = action;
    this.modalInpOldName.value =
      type === "file" && this.prefix === "configs"
        ? name.replace(".conf", "")
        : name;
  }

  //path is empty if new one, else show current name
  setPath(action, path, type) {
    let [prevPath, name] = this.separatePath(path);
    //remove conf if file type
    this.modalPathSuffix.textContent =
      type === "file" && this.prefix === "configs" ? ".conf" : "";
    name =
      type === "file" && this.prefix === "configs"
        ? name.replace(".conf", "")
        : name;

    if (action === "new") {
      this.modalPathPrev.textContent = `${path}`;
      this.modalPathName.value = ``;
    }

    if (action !== "new") {
      this.modalPathPrev.textContent = `${prevPath}`;
      this.modalPathName.value = `${name}`;
    }
  }

  //separate name and previous of path for DOM elements
  separatePath(path) {
    const splitPath = path.split("/");
    const nme = splitPath[splitPath.length - 1];
    const prev = path.replace(nme, "");
    return [prev, nme];
  }

  //disabled for view and delete actions
  setDisabled(action) {
    action === "view" || action === "delete" || action === "download"
      ? this.disabledDOMInpt(true)
      : this.disabledDOMInpt(false);
  }

  //submit text depending action
  setSubmitTxt(action) {
    if (action === "new") return (this.modalSubmit.textContent = "add");
    if (action === "view") return (this.modalSubmit.textContent = "ok");
    if (action === "edit") return (this.modalSubmit.textContent = "edit");
    if (action === "delete") return (this.modalSubmit.textContent = "delete");
    if (action === "download")
      return (this.modalSubmit.textContent = "download");
  }

  //show only if type file and display text
  setEditor(type, content) {
    //SHOW LOGIC
    if (type === "folder") this.modalEditor.classList.add("hidden");

    if (type === "file") this.modalEditor.classList.remove("hidden");

    ace.edit("editor").setValue(content);
  }

  //get all needed info when clicking on action btn
  getInfoFromActionBtn(btnEl) {
    const action = btnEl.getAttribute("value");
    const name = btnEl.getAttribute(`${this.prefix}-action-dropdown-btn`);
    const folder = document.querySelector(`[${this.prefix}-element='${name}']`);
    const level = folder.getAttribute("level");
    const path = folder.getAttribute("path");
    const type = folder.getAttribute("_type");
    let content;
    try {
      content = folder
        .querySelector(`[${this.prefix}-content]`)
        .getAttribute("value");
    } catch (err) {
      content = "";
    }
    return [action, path, type, content, name, level];
  }

  //UTILS
  disabledDOMInpt(bool) {
    this.modalPathName.disabled = bool;
    ace.edit("editor").setReadOnly(bool);
  }

  closeModal() {
    this.modalEl.classList.add("hidden");
    this.modalEl.classList.remove("flex");
  }

  showModal() {
    this.modalEl.classList.add("flex");
    this.modalEl.classList.remove("hidden");
  }
}

export { FolderNav, FolderModal, FolderEditor, FolderDropdown };