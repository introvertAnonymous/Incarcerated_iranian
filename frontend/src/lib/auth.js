export const setToken = (token) => {

  localStorage.setItem('mytoken', token)// make up your own token
}

export const fetchToken = () => {

  return localStorage.getItem('mytoken')
}


// export function RequireToken({ children }) {

//   const auth = fetchToken()
//   if (!auth) {
//     Router
//       .push('/login')
//       .catch(console.error);
//     return;
//   }

//   return children;
// }
