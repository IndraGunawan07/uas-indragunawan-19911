import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'main',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../main/main.module').then((m) => m.MainPageModule)
          },
        ],
      },
      {
        path: 'profile',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../profile/profile.module').then((m) => m.ProfilePageModule)
          },
        ],
      },
      {
        path: 'friend',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../friend/friend.module').then((m) => m.FriendPageModule)
          },
        ],
      },
      {
        path: 'add',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../add/add.module').then((m) => m.AddPageModule)
          },
        ],
      },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
