import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProgressLoader from '../../components/ProgressLoader';
import BQOHome from './views/bqo_home';
import BQOCheckout from './views/bqo_checkout';

export default function BQO() {
    return (
        <>
            <Suspense fallback={<ProgressLoader />}>
                <Routes>
                    <Route path={"/*"} element={<BQOHome />} />
                    <Route path={"/checkout"} element={<BQOCheckout />} />
                    <Route path="*" element={<Navigate to="/404" />} />
                </Routes>
            </Suspense>
        </>
    );
}
