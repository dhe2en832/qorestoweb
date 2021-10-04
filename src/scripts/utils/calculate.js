const percentager = (total, amount) => {
  return ((amount / total) * 100).toFixed(2);
};

const amounter = (total, percent) => {
  return (total * (percent / 100)).toFixed(2);
};

const discounter = (total, discount) => {
  return total - total * (discount / 100);
};

const taxer = (total, discount, tax) => {
  const afterDisc = total - total * (discount / 100);
  return (afterDisc * (tax / 100)).toFixed(2);
};

const subtotaler = (productPrice, productQty, discountAmount) => {
  return (productPrice * productQty - discountAmount).toFixed(2);
};

const totalerafterdiscandtax = (total, discount, tax) => {
  const afterDisc = total - total * (discount / 100);
  const afterTax = afterDisc * (tax / 100);
  return afterDisc + afterTax;
};

const grandtotaler = (grandtotal, shipping) => {
  return parseFloat(grandtotal) + parseFloat(shipping);
};

export {
  percentager,
  amounter,
  discounter,
  taxer,
  subtotaler,
  totalerafterdiscandtax,
  grandtotaler,
};
