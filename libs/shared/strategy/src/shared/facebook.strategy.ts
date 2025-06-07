import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';


@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private config: ConfigService) {
    super({
      clientID:'556847563691372',
      clientSecret: '2113301a89e177bfb21fc9fc2d92ceab',
      callbackURL: `${config.get('callbackURL')}/v1/auth/facebook/callback`,
        
      profileFields: ['id', 'displayName', 'name', 'emails', 'photos'],
      scope: ['email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { name, emails, photos} = profile;
    const user = {
      email: emails?emails[0]?.value:"",
      firstName: name?.givenName,
      lastName: name?.familyName,
    picture: photos[0]?.value,
    };
    const payload = {
      user,
      accessToken,
    };

    done(null, user);
  }
}
