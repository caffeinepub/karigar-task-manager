import Text "mo:core/Text";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";

actor {
  type JobId = Nat;

  type JobType = {
    #new;
    #repair;
  };

  module JobType {
    public func toText(jobType : JobType) : Text {
      switch (jobType) {
        case (#new) { "new" };
        case (#repair) { "repair" };
      };
    };

    public func compare(jobType1 : JobType, jobType2 : JobType) : Order.Order {
      Text.compare(toText(jobType1), toText(jobType2));
    };
  };

  type Material = {
    #gold;
    #silver;
    #other;
  };

  module Material {
    public func toText(material : Material) : Text {
      switch (material) {
        case (#gold) { "gold" };
        case (#silver) { "silver" };
        case (#other) { "other" };
      };
    };

    public func compare(material1 : Material, material2 : Material) : Order.Order {
      Text.compare(toText(material1), toText(material2));
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

  public shared ({ caller }) func createJobRecord(
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

  public query ({ caller }) func getAllJobRecords() : async [JobRecord] {
    jobRecords.values().toArray().sort(JobRecord.compareByCreatedAtDesc);
  };

  public query ({ caller }) func getJobRecord(jobId : JobId) : async JobRecord {
    switch (jobRecords.get(jobId)) {
      case (null) { Runtime.trap("Job record does not exist") };
      case (?jobRecord) { jobRecord };
    };
  };

  public shared ({ caller }) func deleteJobRecord(jobId : JobId) : async () {
    if (not jobRecords.containsKey(jobId)) {
      Runtime.trap("Job record does not exist");
    };
    jobRecords.remove(jobId);
  };
};
