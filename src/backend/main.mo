import Map "mo:core/Map";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";

import Text "mo:core/Text";
import Int "mo:core/Int";


actor {
  // Type definitions
  type JobId = Nat;

  type JobType = {
    #new_;
    #repair;
  };

  module JobType {
    public func compare(jobType1 : JobType, jobType2 : JobType) : Order.Order {
      switch (jobType1, jobType2) {
        case (#new_, #repair) { #less };
        case (#repair, #new_) { #greater };
        case (_, _) { #equal };
      };
    };
  };

  type Material = {
    #gold;
    #silver;
    #other;
  };

  module Material {
    public func compare(material1 : Material, material2 : Material) : Order.Order {
      switch (material1, material2) {
        case (#gold, #silver) { #less };
        case (#silver, #gold) { #greater };
        case (#gold, #other) { #less };
        case (#other, #gold) { #greater };
        case (#silver, #other) { #less };
        case (#other, #silver) { #greater };
        case (_, _) { #equal };
      };
    };
  };

  type JobRecord = {
    id : JobId;
    date : Text;
    billNo : Text;
    material : Material;
    jobType : JobType;
    createdAt : Time.Time;
    itemName : ?Text;
    givenMaterialWeight : ?Float;
    workReceivedDate : ?Text;
    receivedItemWeight : ?Float;
    returnScrapWeight : ?Float;
    lossWeight : ?Float;
    otherCharge : ?Float;
    makingChargeCustomer : ?Float;
    makingChargeKarigar : ?Float;
    workDescription : ?Text;
    remarks : ?Text;
  };

  module JobRecord {
    public func compareByCreatedAtDesc(a : JobRecord, b : JobRecord) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    };
  };

  var nextJobId = 1;
  let jobRecords = Map.empty<JobId, JobRecord>();

  // JobRecord Functions
  public func createJobRecord(
    date : Text,
    billNo : Text,
    material : Material,
    jobType : JobType,
    itemName : ?Text,
    givenMaterialWeight : ?Float,
    workReceivedDate : ?Text,
    receivedItemWeight : ?Float,
    returnScrapWeight : ?Float,
    lossWeight : ?Float,
    otherCharge : ?Float,
    makingChargeCustomer : ?Float,
    makingChargeKarigar : ?Float,
    workDescription : ?Text,
    remarks : ?Text,
  ) : async JobId {
    let jobId = nextJobId;
    nextJobId += 1;

    let newJob : JobRecord = {
      id = jobId;
      date;
      billNo;
      material;
      jobType;
      createdAt = Time.now();
      itemName;
      givenMaterialWeight;
      workReceivedDate;
      receivedItemWeight;
      returnScrapWeight;
      lossWeight;
      otherCharge;
      makingChargeCustomer;
      makingChargeKarigar;
      workDescription;
      remarks;
    };

    jobRecords.add(jobId, newJob);
    jobId;
  };

  public query func getAllJobRecords() : async [JobRecord] {
    jobRecords.values().toArray().sort(JobRecord.compareByCreatedAtDesc);
  };

  public query func getJobRecord(jobId : JobId) : async JobRecord {
    switch (jobRecords.get(jobId)) {
      case (null) { Runtime.trap("Job record does not exist") };
      case (?jobRecord) { jobRecord };
    };
  };

  public func deleteJobRecord(jobId : JobId) : async () {
    if (not jobRecords.containsKey(jobId)) {
      Runtime.trap("Job record does not exist");
    };
    jobRecords.remove(jobId);
  };
};
