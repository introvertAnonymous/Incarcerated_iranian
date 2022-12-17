import Router from 'next/router';
const tokenName = "mytoken";
export const setToken = (token) => {

  localStorage.setItem(tokenName, token)// make up your own token
}

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(tokenName);
    Router.push("/").catch(console.error)
  }
}

export const fetchToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(tokenName)
  }

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
