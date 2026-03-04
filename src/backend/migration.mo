import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Float "mo:core/Float";

module {
  type JobId = Nat;

  type OldJobType = {
    #new;
    #repair;
  };

  type NewJobType = {
    #new_;
    #repair;
  };

  type Material = {
    #gold;
    #silver;
    #other;
  };

  type OldJobRecord = {
    id : JobId;
    date : Text;
    billNo : Text;
    material : Material;
    jobType : OldJobType;
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

  type NewJobRecord = {
    id : JobId;
    date : Text;
    billNo : Text;
    material : Material;
    jobType : NewJobType;
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

  public func run(old : { var nextJobId : JobId; var jobRecords : Map.Map<JobId, OldJobRecord> }) : { var nextJobId : JobId; var jobRecords : Map.Map<JobId, NewJobRecord> } {
    let newJobRecords = old.jobRecords.map<JobId, OldJobRecord, NewJobRecord>(
      func(_id, oldJobRecord) {
        {
          oldJobRecord with jobType = switch (oldJobRecord.jobType) {
            case (#new) { #new_ };
            case (#repair) { #repair };
          };
        };
      }
    );
    { var nextJobId = old.nextJobId; var jobRecords = newJobRecords };
  };
};
