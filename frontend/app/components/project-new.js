import { inject as service } from "@ember/service";
import Component from "@ember/component";
import { computed } from "@ember/object";
import { isBlank } from "@ember/utils";
import { on } from "@ember/object/evented";
import { EKMixin, keyUp } from "ember-keyboard";

export default Component.extend(EKMixin, {
  store: service(),
  intl: service(),

  newProject: computed("personId", function() {
    let project = this.get("store").createRecord("project");
    let technology = this.get("store").createRecord("project-technology", {
      project
    });
    technology.set("offer", []);
    return project;
  }),

  willDestroyElement() {
    if (this.get("newProject.isNew")) {
      this.get("newProject").destroyRecord();
    }
  },

  activateKeyboard: on("init", function() {
    this.set("keyboardActivated", true);
  }),

  abortProjectNew: on(keyUp("Escape"), function() {
    if (this.get("newProject.isNew")) {
      this.get("newProject").destroyRecord();
    }
    this.done(false);
  }),

  suggestion(term) {
    return `"${term}" mit Enter hinzufügen!`;
  },

  focusComesFromOutside(e) {
    let blurredEl = e.relatedTarget;
    if (isBlank(blurredEl)) {
      return false;
    }
    return !blurredEl.classList.contains("ember-power-select-search-input");
  },

  setInitialState(context) {
    context.set("newProject", context.get("store").createRecord("project"));
    context.sendAction("done", true);
  },

  actions: {
    abortNew(event) {
      event.preventDefault();
      this.sendAction("done", false);
    },

    submit(newProject, initNew, event) {
      event.preventDefault();
      let person = this.get("store").peekRecord("person", this.get("personId"));
      newProject.set("person", person);
      return newProject
        .save()
        .then(() =>
          Promise.all([
            ...newProject
              .get("projectTechnologies")
              .map(projectTechnology => projectTechnology.save())
          ])
        )
        .then(project => {
          this.sendAction("done", false);
          if (initNew) this.sendAction("setInitialState", this);
        })
        .then(() => this.get("notify").success("Projekt wurde hinzugefügt!"))
        .catch(() => {
          this.set("newProject.person", null);
          this.get("newProject.errors").forEach(({ attribute, message }) => {
            let translated_attribute = this.get("intl").t(
              `project.${attribute}`
            );
            this.get("notify").alert(`${translated_attribute} ${message}`, {
              closeAfter: 10000
            });
          });
        });
    },

    handleFocus(select, e) {
      if (this.focusComesFromOutside(e)) {
        select.actions.open();
      }
    },

    handleBlur() {},

    createTechnology(selected, searchText) {
      let options = this.get("options");
      if (!options.includes(searchText)) {
        this.get("options").pushObject(searchText);
      }
      if (selected.includes(searchText)) {
        this.get("notify").alert("Already added!", { closeAfter: 4000 });
      } else {
        selected.pushObject(searchText);
      }
    }
  }
});
