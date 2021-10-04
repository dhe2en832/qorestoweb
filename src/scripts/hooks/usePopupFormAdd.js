import { useState } from 'react';

export default function usePopupFormAdd() {
  const [showPopupFormAdd, setShowPopupFormAdd] = useState(false);
  const [submitAddForm, setSubmitAddForm] = useState(false);
  const handleOpenPopupFormAdd = () => setShowPopupFormAdd(true);
  const handleClosePopupFormAdd = () => setShowPopupFormAdd(false);
  const handleSubmitPopupFormAdd = () => {
    setSubmitAddForm(true);
    handleClosePopupFormAdd();
  };

  return {
    showPopupFormAdd,
    submitAddForm,
    handleOpenPopupFormAdd,
    handleClosePopupFormAdd,
    handleSubmitPopupFormAdd,
  };
}
