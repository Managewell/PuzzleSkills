import ApplicationComponent from './application-component';
import { isBlank } from '@ember/utils';

export default ApplicationComponent.extend({

  yearFromInvalid: false,
  yearToInvalid: false,

  init() {
    this._super(...arguments);
    this.monthsToSelect = ['heute', '-'].concat(Array(12).fill().map((x,i) => i + 1 + ""));
    this.monthsFromSelect = ['-'].concat(Array(12).fill().map((x,i) => i + 1 + ""));
    this.selectedMonthTo = '-';
    this.selectedMonthFrom = '-';
    if (!this.get('entity.isNew')) {
      ['To', 'From'].forEach(attr => {
        let selectedValue = this.get('entity.month' + attr);
        if (!this.get('entity.year' + attr)) {
          selectedValue = 'heute';
        }
        else if (!this.get('entity.month' + attr)) {
          selectedValue = '-';
        }
        this.set('selectedMonth' + attr, selectedValue);
      })
    }
  },

  validateYear(year, attr) {
    const invalid = attr + 'Invalid';
    if (!this.get('entity').isYearValid(year)) {
      this.set(invalid, true);
      year = Math.abs(year).toString().slice(0,4);
    } else {
      this.set(invalid, false);
    }
    return year;
  },

  focusComesFromOutside(e) {
    let blurredEl = e.relatedTarget;
    if (isBlank(blurredEl)) {
      return false;
    }
    return !blurredEl.classList.contains('ember-power-select-search-input');
  },

  setYear(year, attr) {
    let validatedYear = this.validateYear(year, 'year' + attr);
    this.set('entity.year' + attr, validatedYear);
  },

  actions: {
    setMonth(attr, month) {
      this.set('entity.month' + attr, isNaN(month) ? null : month);
      if (month == 'heute') this.set('entity.yearTo', null)
      this.set('selectedMonth' + attr, month);
    },

    setYearFrom(year) {
      this.setYear(year, 'From')
    },

    setYearTo(year) {
      this.setYear(year, 'To')
    },

    handleFocus(select, e) {
      if (this.focusComesFromOutside(e)) {
        select.actions.open();
      }
    },

    handleBlur() {
    },
  }
});
