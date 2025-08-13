/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { t, validateNonEmpty } from '@superset-ui/core';
import {
  ControlPanelConfig,
  getStandardizedControls,
  sharedControls
} from '@superset-ui/chart-controls';
import GeofenceControl from './geofenceControl';

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        ['series_columns'],
        [
          {
            name: 'row_limit',
            config: {
              ...sharedControls.row_limit,
              choices: [
                10,
                100,
                1000,
                10000,
                50000,
                100000,
                200000,
                500000,
              ]
            }
          }
        ],
        ['adhoc_filters'],
        [
          {
            name: 'longitude',
            config: {
              ...sharedControls.entity,
              label: t('Longitude'),
            }
          },
        ],
        [
          {
            name: 'latitude',
            config: {
              ...sharedControls.entity,
              label: t('Latitude'),
            }
          },
        ],
        // [
        //   {
        //     name: 'geofence',
        //     config: {
        //       type: GeofenceControl,
        //       label: 'Geofence Control',
        //       description: 'Filters data with a geofence',
        //       default: '',
        //       renderTrigger: true, // Re-render chart when this changes
        //     },
        //   },
        // ],
      ],
    },
    {
      label: t('Geofence Options'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'multi_geofence',
            config: {
              type: 'CheckboxControl',
              label: t('Allow Multiple Geofences'),
              default: false,
              description: t('If enabled, multiple geofences can be applied.'),
              freeForm: true,
            }
          },
        ],
        [
          {
            name: 'geofence_mode',
            config: {
              type: 'SelectControl',
              label: t('Geofence Boolean Mode'),
              freeForm: true,
              choices: ['AND', 'OR'],
              default: 'OR',
              description: t('Determines how multiple geofences are combined.'),
            }
          },
        ],
        [
          {
            name: 'geofence',
            config: {
              type: GeofenceControl,
              label: 'Geofence Control',
              description: 'Filters data with a geofence',
              default: '',
              renderTrigger: true,
              mapStateToProps: (state: any) => {
                return {
                  geofence_mode: state.form_data.geofence_mode,
                  multi_geofence: state.form_data.multi_geofence,
                }
              },
              shouldMapStateToProps: (state: any) => true,
              rerender: ['multi_geofence']
            },
          },
        ],

      ]
    },
    {
      label: t('Geofence Comparison Options'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'enable_compare',
            config: {
              type: 'CheckboxControl',
              label: t('Compare Field'),
              default: false,
              description: t('If enabled, detect if the value of the field appears in more than one geofence.'),
              freeForm: true,
              shouldMapStateToProps: (state: any) => true,
            }
          },
        ],
        [
          {
            name: 'field_to_compare',
            config: {
              ...sharedControls.entity,
              label: t('Field to Compare'),
              visibility: ({ controls }: any) => {
                return controls.enable_compare?.value || false;
              },
              // clearable: true,
              // freeform: true,
              shouldMapStateToProps: () => true,
              mapStateToProps: (state: any, controlState) => {
                // @ts-ignore
                const newState = sharedControls.entity.mapStateToProps(state, controlState);
                return {
                  ...newState,
                  enable_compare: state.form_data?.enable_compare || false,
                }
                // return {
                //   enable_compare: state.form_data?.enable_compare || false,
                //   foo: 'bar'
                //   // enable_compare: state.form_data?.enable_compare || false,
                // }
                // return {
                //   enable_compare: form_data.enable_compare,
                // }
              },
              validators: [
                (v, state) => {
                  console.log('state', state);
                  return ''
                }
              ],
            }
          },
        ],

      ]
    },
    // {
    //   label: t('Options'),
    //   expanded: true,
    //   controlSetRows: [
    //     [
    //       {
    //         name: 'size_from',
    //         config: {
    //           type: 'TextControl',
    //           isInt: true,
    //           label: t('Minimum Font Size'),
    //           renderTrigger: true,
    //           default: 10,
    //           description: t('Font size for the smallest value in the list'),
    //         },
    //       },
    //       {
    //         name: 'size_to',
    //         config: {
    //           type: 'TextControl',
    //           isInt: true,
    //           label: t('Maximum Font Size'),
    //           renderTrigger: true,
    //           default: 70,
    //           description: t('Font size for the biggest value in the list'),
    //         },
    //       },
    //     ],
    //     [
    //       {
    //         name: 'rotation',
    //         config: {
    //           type: 'SelectControl',
    //           label: t('Word Rotation'),
    //           choices: [
    //             ['random', t('random')],
    //             ['flat', t('flat')],
    //             ['square', t('square')],
    //           ],
    //           renderTrigger: true,
    //           default: 'square',
    //           clearable: false,
    //           description: t('Rotation to apply to words in the cloud'),
    //         },
    //       },
    //     ],
    //     ['color_scheme'],
    //   ],
    // },
  ],
  controlOverrides: {
    series: {
      validators: [validateNonEmpty],
      clearable: false,
    },
    row_limit: {
      default: 100,
    },
  },
  formDataOverrides: formData => ({
    ...formData,
    series: getStandardizedControls().shiftColumn(),
    metric: getStandardizedControls().shiftMetric(),
  }),
};

export default config;
