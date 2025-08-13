/*
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

import { ChartProps, getColumnLabel } from '@superset-ui/core';
import { WordCloudProps, WordCloudEncoding } from '../chart/WordCloud';
import { WordCloudFormData } from '../types';

export default function transformProps(chartProps: ChartProps): any {
  const { width, height, formData, queriesData } = chartProps;
  console.log('formData', formData);
  console.log('chartProps', chartProps);
  const {
    colorScheme,
    rotation,
    sliceId,
  } = formData as WordCloudFormData;

  return {
    data: queriesData[0].data,
    // encoding,
    height,
    rotation,
    width,
    sliceId,
    colorScheme,
    multi_geofence: formData.multiGeofence,
    geofence_mode: formData.geofenceMode,
    fieldToCompare: formData.fieldToCompare,
    geofences: formData.geofence,
    enableCompare: formData.enableCompare,
  };
}
