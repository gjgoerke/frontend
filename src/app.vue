/// ////////
// The main vue object of the front end application.
/// ////////

import router from 'vue_app.js'

<template>
  <div id="app"></div>
</template>
<script>
  export default {
    name: 'app',
    data: {
      user: null
    },
    router,
    computed: {
      loggedIn: function () {
        return (!!this.user && !!this.user.auth)
      }
    },
    methods: {
      onLogin: function (userdata) {
        nai.log('Login successful, set data', '[App]')
        this.user = userdata
        nai.setUserToken(userdata)
        router.push('/dashboard')
      },
      doLogout: function () {
        nai.log('Logout', '[App]')
        // reset data
        this.user = null
        nai.logout()
        // go to non-protected site if logout-location is protected
        if (this.$route.meta.requiresAuth) {
          router.push('/')
        }
      }
    },
    beforeMount: function () {
      // 1: check if user is logged-in
      if (nai.isLoggedIn()) {
        try {
          var data = JSON.parse(nai.getUserToken())
          this.user = data
          nai.setAPIToken(data.auth)
        } catch (e) {
          console.log(e)
          nai.logout()
        }
      }

      if (this.loggedIn && this.$route.path == '/') {
        router.push('/dashboard')
      } else {
        // anything?
      }
    },
    created: function () {
      this.$on('login-event', this.onLogin)
    }
  }
</script>
