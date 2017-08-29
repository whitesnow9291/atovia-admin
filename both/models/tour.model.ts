import { CollectionObject } from "./collection-object.model";

export interface Tour extends CollectionObject {
    /* step 1 */
    name: string;
    slug: string;
    description: string;
    departure: string;
    destination: string;
    noOfDays: number;
    noOfNights: number;
    noOfViews: number;
    tourType: string;
    tourPace: string;
    hasGuide: boolean;
    hasFlight: boolean;
    /* step 2 */
    startPrice: number;
    dateRange: [{
      _id: string;
      startDate: Date;
      endDate: Date;
      numOfSeats: number;
      soldSeats: number;
      availableSeats: number;
      price: [{
        numOfPersons: number;
        adult: number;
        child: number;
      }]
    }];
    totalSeats: number;
    totalSoldSeats: number;
    totalAvailableSeats: number;
    /* step 3 */
    itenerary: [
      {
        icon: string;
        dayNum: number;
        title: string;
        description: string;
        hotelType?: string;
        hotelName?: string;
        hasBreakfast: boolean;
        hasLunch: boolean;
        hasDinner: boolean;
      }
    ];
    totalMeals: number;
    /* step 4 */
    featuredImage: {
      id: string;
      url: string;
      name: string;
    };
    images: [
      {
        id: string;
        url: string;
        name: string;
      }
    ],
    /*  step 5*/
    inclusions: string;
    exclusions: string;
    cancellationPolicy: {
      id: string;
      name: string;
      url: string;
    };
    refundPolicy: {
      id: string;
      name: string;
      url: string;
    };
    /*  default */
    owner: {
      id: string;
      companyName: string;
      agentIdentity: {
        verified: boolean;
      };
      agentCertificate: {
        verified: boolean;
      };
      image: {
        id: string;
        url: string;
        name: string;
      }
    };
    active: boolean;
    approved: boolean;
    rejected: boolean;
    deleted: boolean;
    createdAt: Date;
    modifiedAt: Date;
}
