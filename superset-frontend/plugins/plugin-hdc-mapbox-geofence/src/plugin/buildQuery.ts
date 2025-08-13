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

import { buildQueryContext } from '@superset-ui/core';
import { WordCloudFormData } from '../types';
import { get } from 'lodash';

function getWhereClause(formData: WordCloudFormData): string | undefined {
  const {
    geofence,
    latitude,
    longitude,
    geofence_mode, // 'any'|'all' or undefined
  } = formData;

  if (!geofence || geofence.length === 0) {
    console.log('No geofence data available');
    return undefined;
  }

  const point = `ST_Point(${longitude}, ${latitude})`;
  // if mode is 'all', require the point inside every polygon; otherwise allow any
  const joiner = geofence_mode === 'all' ? ' AND ' : ' OR ';

  const clauses = geofence.map((gf: any, idx: number) => {
    // take the first ring of each polygon
    const ring = gf.coordinates[0];
    const coordString = ring
      .map(([lon, lat]: any) => `${lon} ${lat}`)
      .join(', ');
    console.log(`geofence[${idx}] coords:`, coordString);
    return `ST_Contains(
  ST_Polygon("POLYGON ((${coordString}))"),
  ${point}
)`;
  });

  const whereClause = clauses.join(joiner);
  console.log('whereClause', whereClause);
  return whereClause;
}

// function getWhereClause(formData: WordCloudFormData) {
//   if (!formData.geofence || formData.geofence.length == 0) {
//     console.log('No geofence data available');
//     return undefined;
//   }

//   const {
//     geofence,
//     latitude,
//     longitude,
//     geofence_mode,
//     multi_geofence,
//   } = formData;

//   const coordinates = geofence.coordinates[0].map(([lon, lat]: any) => `${lon} ${lat}`);
//   const coordinateString = coordinates.join(', ');
//   console.log('coordinateString', coordinateString);
//   const whereClause = `ST_Contains(ST_Polygon("POLYGON ((${coordinateString}))"), ST_Point(${longitude}, ${latitude}))`;
//   return whereClause;
// }

export default function buildQuery(formData: WordCloudFormData) {
  console.log('formData', formData);

  // MySQL > SELECT ST_Contains(ST_Polygon("POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))"), ST_Point(5, 5));
  // 40.68929894343275, -74.01970374913301
  // (lon, lat)
  const { latitude, longitude, series_columns } = formData;

  return buildQueryContext(formData, baseQueryObject => {
    console.log('baseQueryObject', baseQueryObject);
    const withWhere = [
      {
        ...baseQueryObject,
        ...{
          columns: [
            ...(baseQueryObject.columns ?? []),
            ...(series_columns ?? []),
            latitude,
            longitude
          ],
          extras: {
            // where: `ST_Contains(ST_Polygon("POLYGON ((${coordinateString}))"), ST_Point(${longitude}, ${latitude}))`,
            where: getWhereClause(formData)
          }
        }

      }
    ]
    console.log('withWhere', withWhere);
    return withWhere
  })

}
