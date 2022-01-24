import moment from 'moment';
import Config from '../Config';

export const toCurrency = (value) => {
  const formatter = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return formatter + '.00';
};

export const toCurrencyIDR = (value) => {
  const formatter = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return formatter
};

export const convertNewLine = (text) => {
  const regExp = [/(?:\r\n|\r|\n)/g, '<br/>']
  return text.replace(...regExp);
};

export const stringToDate = (string) => {
  return moment(string, Config.DATE_POST_FORMAT).format(Config.DATE_DEFAULT_FORMAT);
};

export const dateToString = (date) => {
  return moment(date).format(Config.DATE_POST_FORMAT);
};

export const timeToString = (time) => {
  return moment(time).format(Config.TIME_POST_FORMAT);
};

export const alignmentConvert = (alignment) => {
  switch (alignment) {
    case "R":
      return "right"
    case "C":
      return "center"
    default:
      return "left"
  }
}