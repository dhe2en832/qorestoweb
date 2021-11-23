import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

export default function ConfirmDialog(
  title = '',
  html = <p></p>,
  confirmText = '',
  confirmed = () => {},
  cancelled = () => {}
) {
  const reactSwal = withReactContent(
    Swal.mixin({
      customClass: {
        container: 'react-swal',
      },
    })
  );
  return reactSwal
    .fire({
      icon: 'warning',
      title,
      html,
      showCancelButton: true,
      confirmButtonColor: '#3f50b5',
      cancelButtonColor: '#d32f2f',
      confirmButtonText: confirmText,
      cancelButtonText: 'Batal',
    })
    .then((result) => {
      if (result.isConfirmed) {
        return confirmed();
      } else {
        return cancelled();
      }
    });
}
