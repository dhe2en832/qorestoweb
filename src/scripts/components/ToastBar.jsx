import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

export default function ToastBar(
  icon = 'error',
  title = 'This Message Is From No Where',
  timer = 0,
  afterOpen = () => {},
  position = 'top-end',
) {
  const Toast = withReactContent(
    Swal.mixin({
      customClass: {
        container: 'react-swal',
      },
      toast: true,
      position,
      showConfirmButton: false,
      timer,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
        afterOpen();
      },
    }),
  );

  Toast.fire({
    icon,
    title,
  });
}
