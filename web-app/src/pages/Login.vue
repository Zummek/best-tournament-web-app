<template>
  <q-page class="container flex flex-center">
    <div class="row full-width justify-center">
      <q-card class="col-sm-9 col-md-7 col-xl-5">
        <q-card-section horizontal>
          <img
            v-if="$q.screen.gt.md"
            class="image__logo"
            style="flex: 2; max-width: 100%; height: auto;"
            :src="logoUrl"
          />
          <q-separator inset size="0.13em" vertical />

          <q-card-section style="flex: 3">
            <q-card-section class="row justify-center">
              <div class="text-center">
                <q-icon name="emoji_events" size="4.4em" />
                <div class="text-h6">
                  Welcome to <br />
                  best tournament application!
                </div>
                <div class="text-subtitle2" style="margin-top: 20px">
                  Sign in via Microsoft Office account and enjoy company fun
                </div>
              </div>
            </q-card-section>
            <q-card-section class="row justify-center">
              <q-btn
                color="accent"
                icon="mail"
                label="Login with Microsoft"
                @click="loginWithMS"
              />
            </q-card-section>
            <q-card-section
              class="row justify-center authors text-weight-light"
            >
              Authors: <br />
              Adam Jędryka, Przemysław Rychter <br />
              Kuba Pawleniak, Kamil Zaborowski
            </q-card-section>
          </q-card-section>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import api from './../services/API';
import { Vue, Component } from 'vue-property-decorator';
import store from 'src/store';

@Component
export default class Login extends Vue {
  private logoUrl = '';

  private async loginWithMS() {
    const authUrl = await api.auth.getLoginUrl();
    window.location = authUrl;
  }
  private async mounted() {
    if (this.$route.query.code) {
      this.$q.loading.show({
        message: '<span class="text-orange text-weight-bold">Loading...</span>',
      });
      await api.auth.getCookieToken(this.$route.query.code as string);
      await store.dispatch(
        'currentUser/decodeTokenAndStore',
        this.$cookies.get('jwt')
      );
      // const response = await api.organization.getUsers();
      // await api.organization.getUserPhoto(response[0].id);
      this.$q.loading.hide();
      await this.$router.replace({ name: 'TournamentsList' });
    }
  }
  private async created() {
    this.logoUrl = await api.organization.getAzureADApplicationLogo();
  }
}
</script>

<style lang="scss" scoped>
.authors {
  color: gray;
}

.container {
  background: linear-gradient($orange-1, $orange-2, $accent);
  // background: linear-gradient(19deg, #ede7e7 0%, #e7e2f7 100%);
}
</style>
