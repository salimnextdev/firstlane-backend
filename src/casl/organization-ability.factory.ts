// import {
//   AccountDto,
//   AuthenticatorDTO,
//   CampaignFundsDto,
//   CandidateDto,
//   CreateActivityLogDTO,
//   DonationDTO,
//   EventDTO,
//   ExpenseDTO,
//   FaqDTO,
//   ManifestoDTO,
//   MediaDTO,
//   OrganizationDTO,
//   OTPDTO,
//   RoleDTO,
//   SubEventDTO,
//   SupportTicketDTO,
//   SurveyPollsDTO,
//   TownhallDTO,
//   UserDTO,
// } from '@app/dto';
// import { RecoveryQuestionDTO } from '@app/dto/reference/recovery-question.dto';

// import { Action,  } from '@app/enum';
// import {
//   OrganizationModel,
//   OrganizationDoc,
//   UserModel,
//   UserDoc,
//   AssignRoleModel,
//   AssignRoleDoc,
//   AccountModel,
//   ActivityLogDoc,
//   ActivityLogModel,
//   AuthenticatorDoc,
//   AuthenticatorModel,
//   CampaignFundsModel,
//   CandidateDoc,
//   CandidateModel,
//   DonationModel,
//   EventDoc,
//   EventModel,
//   ExpenseModel,
//   FaqDoc,
//   FaqModel,
//   ManifestoDoc,
//   ManifestoModel,
//   MediaDoc,
//   MediaModel,
//   OTPDoc,
//   OTPModel,
//   RecoveryQuestionDoc,
//   RecoveryQuestionModel,
//   RoleDoc,
//   RoleModel,
//   SubEventDoc,
//   SubEventModel,
//   SupportTicketDoc,
//   SupportTicketModel,
//   SurveyPollsDoc,
//   SurveyPollsModel,
//   TownhallModel,
//   ExpenseDocument,
//   AccountDocument,
//   CampaignFundsDocument,
//   TownhallDocument,
//   DonationDocument,
// } from '@app/schema';
// import {
//   AbilityBuilder,
//   AbilityClass,
//   ExtractSubjectType,
//   ForbiddenError,
//   InferSubjects,
//   PureAbility,
// } from '@casl/ability';
// import { ForbiddenException, Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';

// type Subjects =
//   | InferSubjects<
//       | typeof UserModel
//       | typeof OrganizationModel
//       | typeof UserModel
//       | typeof AssignRoleModel
//       | typeof RoleModel
//       | typeof ActivityLogModel
//       | typeof OrganizationModel
//       | typeof AccountModel
//       | typeof AuthenticatorModel
//       | typeof OTPModel
//       | typeof EventModel
//       | typeof SubEventModel
//       | typeof ExpenseModel
//       | typeof CampaignFundsModel
//       | typeof TownhallModel
//       | typeof SurveyPollsModel
//       | typeof MediaModel
//       | typeof SupportTicketModel
//       | typeof CandidateModel
//       | typeof RecoveryQuestionModel
//       | typeof ManifestoModel
//       | typeof FaqModel
//       | typeof DonationModel
//     >
//   | 'all';

// type AppAbility = PureAbility<[Action, Subjects]>;

// @Injectable()
// export class OrganizationAbilityFactory {
//   constructor(
//     @InjectModel(UserModel.name) private userModel: Model<UserDoc>,
//     @InjectModel(OrganizationModel.name)
//     private organizationModel: Model<OrganizationDoc>,
//     @InjectModel(AssignRoleModel.name)
//     private assignRoleModel: Model<AssignRoleDoc>,

//     @InjectModel(ActivityLogModel.name)
//     private activityLogModel: Model<ActivityLogDoc>,
//     @InjectModel(AccountModel.name)
//     private accountModel: Model<AccountDocument>,
//     @InjectModel(AuthenticatorModel.name)
//     private authenticatorModel: Model<AuthenticatorDoc>,
//     @InjectModel(OTPModel.name) private otpModel: Model<OTPDoc>,
//     @InjectModel(EventModel.name) private eventModel: Model<EventDoc>,
//     @InjectModel(SubEventModel.name) private subEventModel: Model<SubEventDoc>,
//     @InjectModel(ExpenseModel.name)
//     private expenseModel: Model<ExpenseDocument>,
//     @InjectModel(CampaignFundsModel.name)
//     private campaignFundsModel: Model<CampaignFundsDocument>,
//     @InjectModel(TownhallModel.name)
//     private townhallModel: Model<TownhallDocument>,
//     @InjectModel(SurveyPollsModel.name)
//     private surveyPollsModel: Model<SurveyPollsDoc>,
//     @InjectModel(MediaModel.name) private mediaModel: Model<MediaDoc>,
//     @InjectModel(SupportTicketModel.name)
//     private supportTicketModel: Model<SupportTicketDoc>,
//     @InjectModel(CandidateModel.name)
//     private candidateModel: Model<CandidateDoc>,
//     @InjectModel(RecoveryQuestionModel.name)
//     private recoveryQuestionModel: Model<RecoveryQuestionDoc>,
//     @InjectModel(ManifestoModel.name)
//     private manifestoModel: Model<ManifestoDoc>,
//     @InjectModel(FaqModel.name) private faqModel: Model<FaqDoc>,
//     @InjectModel(DonationModel.name)
//     private donationModel: Model<DonationDocument>,
//   ) {}

//   async defineAbility(data: { organizationID: string; userID: string,action:string ,model:any}) {
//     const { can, cannot, build } = new AbilityBuilder<
//       PureAbility<[Action, Subjects]>
//     >(PureAbility as AbilityClass<AppAbility>);
//     const organizationRole = await this.assignRoleModel
//       .find({
//         users: data.userID,
//         organizationID: data.organizationID,
//         permissions:`${data.model?.name}${data.action}`
//       })
//       ;

//     const organization = await this.organizationModel
//       .findById(data.organizationID);

//     // const roleMap = organizationRole.map((role) => role.name);
//     const permissions = organizationRole.map((role) => role.permissions).flat();
//     // console.log("data",data)
//     // console.log("organizationRole",organizationRole)
//     console.log("permissions",permissions)
//     console.log("permissions",data.action,data.model)
//     if (organization?.ownerID === data.userID) {
//       can(data.action as Action, data.model);
//     } else {
//       if (hasPermission(permissions, data.action as Action, data.model?.name)) {
//           console.log(data.action,data.model?.name)
//           can(data.action as Action, data.model).because('Has Permission')
//       } else{
//         console.log("hasPermission",false)
//         cannot(data.action as Action, getModelByName(data.model)).because('No Permission');
//       }
    
//     }

//     return build({
//       detectSubjectType: (item) =>
//         item.constructor as ExtractSubjectType<Subjects>,
//     });
//   }

//   async checkAbility(
//     organizationID: string,
//     userID: string,
//     action: string,
//     model: any,
//   ): Promise<void> {
//     const abilityparams = {
//       organizationID,
//       userID,
//       action,
//       model
//     };
//     const ability = await this.defineAbility(abilityparams);
    
//     try {
//       ForbiddenError.from(ability).throwUnlessCan(Action[action], model);
//     } catch (error) {
//       if (error instanceof ForbiddenError) {
//         throw new ForbiddenException(error.message);
//       }
//     }
//   }
// }
//  const PermissionType = ["Create", "Update", "Read", "Delete"]
//  const Permission = [
//   'UserModel',
//   'AssignRoleModel',
//   'ActivityLogModel',
//   'OrganizationModel',
//   'AccountModel',
//   'AccountModel',
//   'OTPModel',
//   'EventModel',
//   'SubEventModel',
//   'ExpenseModel',
//   'CampaignFundsModel',
//   'TownhallModel',
//   'SurveyPollsModel',
//   'MediaModel',
//   'SupportTicketModel',
//   'CandidateModel',
//   'RecoveryQuestionModel',
//   'ManifestoModel',
//   'FaqModel',
//   'DonationModel',
// ];


//  const AllPermissions = Permission.flatMap(model =>
//   PermissionType.map(action => `${model}${action}`)
// );

//  function hasPermission(userPermissions: string[], action: Action, model: string): boolean {

//   return userPermissions.includes(`${model}${action}`);
// }
// const modelMap = {
//   UserModel,
//   AssignRoleModel,
//   RoleModel,
//   ActivityLogModel,
//   OrganizationModel,
//   AccountModel,
//   AuthenticatorModel,
//   OTPModel,
//   EventModel,
//   SubEventModel,
//   ExpenseModel,
//   CampaignFundsModel,
//   TownhallModel,
//   SurveyPollsModel,
//   MediaModel,
//   SupportTicketModel,
//   CandidateModel,
//   RecoveryQuestionModel,
//   ManifestoModel,
//   FaqModel,
//   DonationModel,
// };
// function getModelByName(modelName: string) {
//   return modelMap[modelName] || null;
// }
