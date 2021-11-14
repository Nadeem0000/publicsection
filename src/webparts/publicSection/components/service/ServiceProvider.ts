import { WebPartContext } from "@microsoft/sp-webpart-base";
import { MSGraphClient } from "@microsoft/sp-http";
var response = response || [];
var url = `/me/drive/recent`; //?$orderby=lastModifiedDateTime desc

export class ServiceProvider {
  public _graphClient: MSGraphClient;
  private spcontext: WebPartContext;
  public constructor(spcontext: WebPartContext) {
    this.spcontext = spcontext;
  }

  

  //To Get recents
  public getMyDriveRecents = async (): Promise<[]> => {
    this._graphClient = await this.spcontext.msGraphClientFactory.getClient(); //TODO    
    let myDriveRecents: [] = [];
    
    //try{
      const teamsResponse2 = await this._graphClient.api(`${url}`).version('v1.0').top(500).get();
      myDriveRecents = teamsResponse2.value as [];
      //myDriveRecents = teamsResponse2;      
      /*response = response.concat(teamsResponse2);
      if (teamsResponse2["@odata.nextLink"]) {
        url = teamsResponse2["@odata.nextLink"];
        this.getMyDriveRecents();
      }
      console.log(response);*/
    /*}catch(error){
      console.log('unable to get myDriveRecents', error);
    }*/
    return myDriveRecents;
  }   
}