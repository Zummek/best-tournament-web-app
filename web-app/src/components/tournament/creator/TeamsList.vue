<template>
  <q-table
    :grid="$q.screen.lt.sm"
    :title="tournamentName ? tournamentName : $t('tournament.team.list')"
    :data="data"
    :columns="columns"
    row-key="name"
    virtual-scroll
    :class="$q.screen.gt.xs ? 'sticky-virtscroll-table' : ''"
    :pagination="pagination"
    :rows-per-page-options="[0]"
    :virtual-scroll-sticky-size-start="48"
  >
    <template v-slot:no-data>
      <div class="full-width row flex-center text-accent q-gutter-sm">
        <q-icon size="2em" name="sentiment_dissatisfied" /><br />
        {{ $t('tournament.error.noTeamsAddedCreator') }}
      </div>
    </template>

    <!-- For List Table View -->
    <template v-slot:body-cell-name="props">
      <q-td :props="props" style="max-width: 8em" class="textWrapDotted">
        {{ props.value }}
        <q-tooltip>
          {{ props.value }}
        </q-tooltip>
      </q-td>
    </template>
    <template v-slot:body-cell-participants="props">
      <q-td style="max-width: 4em" class="textWrapDotted">
        <div
          class="row col text-grey-14 justify-end"
          style="font-size:0.7em"
          v-for="player in props.row.members"
          :key="player.id"
        >
          {{ player.firstName }} {{ player.lastName }}
        </div>
      </q-td>
    </template>
    <template v-slot:body-cell-action="props">
      <q-td style="width:1em">
        <q-btn
          dense
          flat
          text-color="red"
          icon="close"
          @click="deleteTeam(props.row)"
        />
      </q-td>
    </template>
    <template v-if="tournType" v-slot:top-right>
      <q-icon
        :name="tournType == 'single-elimination' ? 'emoji_events' : 'groups'"
        size="200%"
      />
    </template>

    <!-- For Grid Table View -->
    <template v-slot:item="props">
      <div class="row q-pa-xs col-12">
        <q-card class="row col-12 items-center">
          <q-card-section class="row col" style="text-align:left">
            <div class="text-grey-14 q-px-xs">{{ $t('common.name') }}:</div>
            <strong class="textWrapDotted">{{ props.row.name }}</strong>
          </q-card-section>
          <q-card-section
            class="col-4 overflow-hidden "
            style="text-align:left"
          >
            <div
              class="row col text-grey-14"
              style="font-size:0.7em"
              v-for="player in props.row.members"
              :key="player.id"
            >
              {{ player.firstName }} {{ player.lastName }}
            </div>
          </q-card-section>
          <q-card-actions class="col-1 q-mr-lg">
            <q-btn
              dense
              flat
              icon="close"
              text-color="red"
              @click="deleteTeam(props.row)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </template>
  </q-table>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { IPagination } from 'src/components/models';
import { Team } from '../../../../../shared/types/Tournament';
import { QTable } from 'quasar/dist/types';

@Component
export default class TeamsList extends Vue {
  @Prop({ type: Object, required: true }) readonly pagination!: IPagination;
  @Prop({ type: Array, required: true }) readonly columns!: QTable['columns'];
  @Prop({ type: String, default: () => '' }) readonly expanded!: string;
  @Prop({ type: Array, default: () => [] }) readonly data!: Team[];
  @Prop({ type: String }) readonly tournType!: string;
  @Prop({ type: String }) readonly tournamentName!: string;

  private deleteTeam(team: Team) {
    this.data.splice(this.data.indexOf(team), 1);
  }
}
</script>
<style lang="sass">
.sticky-virtscroll-table
  height: 75vh

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    background-color: #fff

  thead tr th
    position: sticky
    z-index: 1
  thead tr:last-child th
    top: 48px
  thead tr:first-child th
    top: 0
</style>
