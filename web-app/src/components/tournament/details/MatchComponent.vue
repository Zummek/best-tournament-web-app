<template>
  <q-card
    class="q-pa-sm-xs q-mb-md"
    :style="small ? 'min-width: 300px' : 'min-width: 500px'"
  >
    <q-card-section
      class="row no-wrap q-py-sm"
      :class="[small ? 'q-px-sm' : 'q-px-md']"
    >
      <div style="flex: 1; min-width: 180px">
        <team-component
          :team="match.teamA"
          flat
          :smallIcon="small"
          :textCenter="small"
        />
        <team-component
          v-if="small"
          textCenter
          smallIcon
          :team="match.teamB"
          flat
          class="q-mt-sm"
        />
      </div>

      <q-separator v-if="small" vertical inset />

      <div
        @mouseover="showActionButton = true"
        @mouseleave="showActionButton = false"
        style="height: 50px; min-width: 120px"
        class="q-ma-auto column self-center justify-center"
      >
        <!-- <div class="matchDate">{{ matchFormatedDate }}</div> -->
        <q-btn
          no-caps
          v-if="isAllowedToEditMatchScore"
          class="q-my-auto q-mx-auto"
          :color="scoreActionBtnColor"
          :label="scoreActionBtnLabel"
          @click="scoreActionBtnOnClick"
          :size="small ? '12px' : '13px'"
          padding="xs sm"
        />
        <div v-else style="text-align: center">
          <div class="score q-mx-auto">{{ formatedScore }}</div>
          <div class="status q-mx-auto">{{ getMatchStatus }}</div>
        </div>
      </div>

      <div v-if="!small" style="flex: 1">
        <team-component :team="match.teamB" flat inverted />
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { Match } from 'app/../shared/types/Tournament';
import store from '../../../store';
import { Vue, Component, Prop } from 'vue-property-decorator';
// import moment from 'moment';
import ScoreInputDialog from './ScoreInputDialog.vue';
import TeamComponent from '../details/TeamComponent.vue';
import API from 'src/services/API';
import { UpdateTournamentMatchPayload } from 'src/services/API/apiResources/types';

@Component({
  components: {
    TeamComponent,
  },
})
export default class MatchComponent extends Vue {
  @Prop({ type: Object, required: true }) readonly match!: Match;
  @Prop({ type: Boolean, required: true }) readonly isOwner!: boolean;
  @Prop({ type: String, required: true }) readonly tournamentId!: string;
  @Prop({ type: Boolean, default: false }) readonly small!: boolean;

  private showActionButton = false;

  // get matchFormatedDate() {
  //   return (
  //     moment(this.match.date).format('L') +
  //     ' ' +
  //     moment(this.match.date).format('LT')
  //   );
  // }

  get formatedScore() {
    if (this.match.score.final.a === -1) return '- : -';
    return `${this.match.score.final.a} : ${this.match.score.final.b}`;
  }

  get scoreActionBtnLabel() {
    if (this.isOwner && this.hasConflict)
      return this.$t('tournament.match.resolveConflict');
    return this.$t('tournament.match.addScore');
  }

  get scoreActionBtnColor() {
    if (this.isOwner && this.hasConflict) return 'negative';
    return 'primary';
  }

  get scoreActionBtnOnClick() {
    if (this.isOwner && this.hasConflict) return () => this.resolveConflict();
    return () => this.addScore();
  }

  get getAssignedTeam() {
    const currentUserId = store.state.currentUser.id;

    if (this.match.teamA)
      for (let i = 0; i < this.match.teamA.members.length; i++) {
        if (this.match.teamA.members[i].id === currentUserId) return 'teamA';
      }

    if (this.match.teamB)
      for (let i = 0; i < this.match.teamB.members.length; i++) {
        if (this.match.teamB.members[i].id === currentUserId) return 'teamB';
      }

    return false;
  }

  get isMyTeamAlreadyReportedScore() {
    if (this.getAssignedTeam === 'teamA')
      return this.match.score.reportedByA.a !== -1;
    else if (this.getAssignedTeam === 'teamB')
      return this.match.score.reportedByB.a !== -1;
    else return false;
  }

  get hasConflict() {
    return (
      this.match.score.reportedByA.a !== -1 &&
      this.match.score.reportedByB.a !== -1 &&
      JSON.stringify(this.match.score.reportedByA) !==
        JSON.stringify(this.match.score.reportedByB) &&
      !this.match.isFinished
    );
  }

  get isAllowedToEditMatchScore() {
    return (
      (!this.match.isFinished &&
        this.getAssignedTeam &&
        !this.isMyTeamAlreadyReportedScore) ||
      (this.isOwner && this.hasConflict)
    );
  }

  get getMatchStatus() {
    if (this.isMyTeamAlreadyReportedScore)
      return this.$t('tournament.match.scorePendingApproval');
    if (this.hasConflict) return this.$t('tournament.match.ownerMustResolveConflict');
  }

  private resolveConflict() {
    this.$q
      .dialog({
        component: ScoreInputDialog,
        parent: this,
        mode: 'resolving',
        teamAName: this.match.teamA?.name,
        teamBName: this.match.teamB?.name,
        score: this.match.score,
        isOwner: this.isOwner,
      })
      .onOk(async (data: UpdateTournamentMatchPayload) => {
        await API.tournament.updateTournamentMatch(
          this.tournamentId,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.match.id!,
          data
        );
        this.$q.notify({
          message: this.$t(
            'tournament.match.scoreInputDialog.disputeBetweenTeamsHasBeenResolved'
          ).toString(),
          color: 'primary',
        });
        this.$emit('refreshData');
      });
  }

  private addScore() {
    this.$q
      .dialog({
        component: ScoreInputDialog,
        parent: this,
        mode: 'add',
        teamAName: this.match.teamA?.name,
        teamBName: this.match.teamB?.name,
        score: this.match.score,
        isOwner: this.isOwner,
      })
      .onOk(async (data: UpdateTournamentMatchPayload) => {
        await API.tournament.updateTournamentMatch(
          this.tournamentId,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.match.id!,
          data
        );
        this.$q.notify({
          message: this.$t(
            'tournament.match.scoreInputDialog.addedScoreToMatch'
          ).toString(),
          color: 'primary',
        });
        this.$emit('refreshData');
      });
  }
}
</script>

<style lang="scss" scoped>
.matchDate {
  color: gray;
  font-size: smaller;
  text-align: center;
  line-height: 1.2;
}

.score {
  line-height: 1.12;
  font-size: xx-large;
  font-weight: 600;
}

.status {
  font-size: 11px;
  color: gray;
  font-weight: 400;
  max-width: 100px;
  text-align: center;
}
</style>