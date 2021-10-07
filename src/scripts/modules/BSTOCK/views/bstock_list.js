// import React from 'react';
// import Container from '@mui/material/Container';
// import Grid from '@mui/material/Grid';
// import Typography from '@mui/material/Typography';
// import SearchBar from '../../../components/SearchBar';
// import { AddElem } from '../../../components/ButtonActions';
// import TableWrapperComplex from '../../../components/TableWrapperComplex';
// import useTableLists from '../../../hooks/useTableLists';

// import bstock_api from '../controller/bstock_api';
// import { headCells, bodyCells } from '../model/bstock_table';
// import { confName, confPrimKey, confSecKey } from '../model/bstock_config';

// export default function BSTOCKList() {
//   const { url, searchLabel, handleSearch, handleDelete, setFilterBy, filteredLists } =
//     useTableLists({
//       dataSource: bstock_api,
//       headCells,
//       initOrder: confPrimKey,
//       initName: confName,
//     });

//   return (
//     <Container maxWidth="lg">
//       <Grid container alignItems="center" justifyContent="space-between" spacing={1}>
//         <Grid item>
//           <Typography variant="h6" component="h1">
//             Master {confName}
//           </Typography>
//         </Grid>
//         {/* <Grid item>
//           <AddElem url={''} title={confName} />
//         </Grid> */}
//         <Grid item>
//           <SearchBar name="searchBar_list" label={'Cari: ' + searchLabel} change={handleSearch} />
//         </Grid>
//       </Grid>
//       <TableWrapperComplex
//         keyName={confName}
//         keyID={confPrimKey}
//         keyURL={url}
//         headCells={headCells}
//         bodyCells={bodyCells}
//         initOrder={confPrimKey}
//         setFilterBy={setFilterBy}
//         filteredDatas={filteredLists}
//         isLookup={false}
//         handleDelete={handleDelete}
//       />
//     </Container>
//   );
// }
