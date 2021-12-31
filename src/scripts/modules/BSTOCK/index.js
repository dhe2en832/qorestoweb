import React, { Suspense } from 'react';
import { Routes, Route, useMatch } from 'react-router-dom';
import ProgressLoader from '../../components/ProgressLoader';
import BSTOCKList from './views/bstock_list';

export default function BSTOCK() {
  const { pathname } = useMatch();
  return (
    <>
      <Suspense fallback={<ProgressLoader />}>
        <Routes>
          <Route exact path={pathname} element={<BSTOCKList />} />
          <Route from="*" to="/404" />
        </Routes>
      </Suspense>
    </>
  );
}
