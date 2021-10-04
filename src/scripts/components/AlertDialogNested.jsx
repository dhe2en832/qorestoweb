import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

export default function AlertDialogNested(
  id = '#',
  icon = '',
  title = '',
  html = <p></p>,
  afterClose = () => {},
  timer = 0,
  showConfirmButton = true,
) {
  const reactSwal = withReactContent(
    Swal.mixin({
      customClass: {
        container: 'react-swal',
      },
      target: `#AlertDialogNested_${id}`,
      timerProgressBar: true,
    }),
  );
  reactSwal.fire({
    icon,
    title,
    html,
    didClose: afterClose,
    confirmButtonColor: '#3f50b5',
    showConfirmButton,
    timer,
  });
}
