import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProgressLoader from '../../components/ProgressLoader';
import Navigation from '../../components/Navigation';
import ModuleContext from '../../contexts/ModuleContext'
import BSOList from './views/bso_list';
import BSOListFast from './views/bso_list_fast';
import BSOForm from './views/bso_form';

export default function BSO() {
  return (
    <>
      <Navigation navLink={ModuleContext} />
      <Suspense fallback={<ProgressLoader />}>
        <Routes>
          <Route path={"/*"} element={<BSOList />} />
          <Route path={`add`} element={<BSOForm mode="add" />} />
          <Route path={`edit/:id`} element={<BSOForm mode="edit" />} />
          <Route path={`fast/*`} element={<BSOListFast />} />
          <Route path={`fast/add`} element={<BSOForm mode="add" />} />
          <Route path={`fast/edit/:id`} element={<BSOForm mode="edit" />} />
          <Route path="*" element={<Navigate to="/404" />} />
        </Routes>
      </Suspense>
    </>
  );
}
