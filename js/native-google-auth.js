import { SocialLogin } from '@capgo/capacitor-social-login';

let initialized = false;

export async function nativeGoogleSignIn(auth, GoogleAuthProvider, signInWithCredential) {
  if (!initialized) {
    await SocialLogin.initialize({
      google: {
        webClientId: '33661162829-tphejaaj5k475t33h7upb1ktpqdtc6ms.apps.googleusercontent.com'
      }
    });
    initialized = true;
  }
  const res = await SocialLogin.login({
    provider: 'google',
    options: { scopes: ['email', 'profile'] }
  });
  const credential = GoogleAuthProvider.credential(res.result.idToken);
  await signInWithCredential(auth, credential);
}